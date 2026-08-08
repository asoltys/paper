import { browser } from "$app/environment";
import { PUBLIC_ELECTRUM } from "$env/static/public";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import * as btc from "@scure/btc-signer";
import { network } from "$lib";

// Electrum over WebSocket (Fulcrum). One shared connection answers data
// queries and pushes scripthash.subscribe notifications, replacing REST
// polling with realtime updates.

export const scripthash = (address) => {
	const h = sha256(btc.OutScript.encode(btc.Address(network).decode(address)));
	h.reverse();
	return bytesToHex(h);
};

let ws;
let id = 0;
let backoff = 1000;
let queue = [];
const pending = new Map(); // id -> { resolve, reject, timer }
const subs = new Map(); // scripthash -> Set<callback>

const dispatch = (line) => {
	let msg;
	try {
		msg = JSON.parse(line);
	} catch {
		return;
	}
	if (msg.id != null && pending.has(msg.id)) {
		const p = pending.get(msg.id);
		pending.delete(msg.id);
		clearTimeout(p.timer);
		if (msg.error)
			p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
		else p.resolve(msg.result);
	} else if (msg.method === "blockchain.scripthash.subscribe") {
		const [sh, status] = msg.params;
		for (const cb of subs.get(sh) || []) cb(status);
	}
};

const connect = () => {
	if (!browser) return;
	if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;

	ws = new WebSocket(PUBLIC_ELECTRUM);

	ws.onopen = () => {
		backoff = 1000;
		for (const payload of queue) ws.send(payload);
		queue = [];
		for (const sh of subs.keys())
			call("blockchain.scripthash.subscribe", [sh]).catch(() => {});
	};

	ws.onmessage = (e) => {
		for (const line of String(e.data).split("\n")) if (line) dispatch(line);
	};

	ws.onclose = () => {
		setTimeout(connect, backoff);
		backoff = Math.min(backoff * 2, 30000);
	};

	ws.onerror = () => ws.close();
};

export const call = (method, params = []) =>
	new Promise((resolve, reject) => {
		connect();
		const i = ++id;
		const timer = setTimeout(() => {
			if (pending.delete(i)) reject(new Error(`electrum timeout: ${method}`));
		}, 15000);
		pending.set(i, { resolve, reject, timer });
		const payload = `${JSON.stringify({ id: i, method, params })}\n`;
		if (ws && ws.readyState === 1) ws.send(payload);
		else queue.push(payload);
	});

// cb fires with the scripthash status on every change; returns unsubscribe
export const subscribe = (address, cb) => {
	const sh = scripthash(address);
	if (!subs.has(sh)) subs.set(sh, new Set());
	subs.get(sh).add(cb);
	call("blockchain.scripthash.subscribe", [sh]).catch(() => {});
	return () => {
		const set = subs.get(sh);
		if (!set) return;
		set.delete(cb);
		if (!set.size) {
			subs.delete(sh);
			call("blockchain.scripthash.unsubscribe", [sh]).catch(() => {});
		}
	};
};

// { confirmed, unconfirmed } in sats (unconfirmed can be negative)
export const balance = (address) =>
	call("blockchain.scripthash.get_balance", [scripthash(address)]);

export const utxos = async (address) => {
	const u = await call("blockchain.scripthash.listunspent", [
		scripthash(address),
	]);
	return u.map((x) => ({
		txid: x.tx_hash,
		vout: x.tx_pos,
		value: x.value,
		confirmed: x.height > 0,
	}));
};

// estimatefee returns BTC/kB; convert to sat/vB
export const fees = async () => {
	const [f1, f3, f6, f144, relay] = await Promise.all(
		[1, 3, 6, 144].map((n) => call("blockchain.estimatefee", [n])).concat(
			call("blockchain.relayfee"),
		),
	);
	const perVb = (btckb, fallback) =>
		btckb > 0 ? Math.max(1, Math.ceil(btckb * 1e5)) : fallback;
	return {
		fastestFee: perVb(f1, 10),
		halfHourFee: perVb(f3, 5),
		hourFee: perVb(f6, 3),
		economyFee: perVb(f144, 2),
		minimumFee: perVb(relay, 1),
	};
};

export const txHex = (txid) => call("blockchain.transaction.get", [txid]);

export const broadcast = (hex) =>
	call("blockchain.transaction.broadcast", [hex]);
