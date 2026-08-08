import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { PUBLIC_EXPLORER, PUBLIC_NETWORK } from "$env/static/public";
import { secp256k1 } from "@noble/curves/secp256k1";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { sha256 } from "@noble/hashes/sha256";
import { createBase58check } from "@scure/base";
import * as btc from "@scure/btc-signer";
import validate from "bitcoin-address-validation";
import { writable } from "svelte/store";
import * as WIF from "wif";

const base58check = createBase58check(sha256);

export const api = PUBLIC_EXPLORER;
export const network = {
	bitcoin: {
		bech32: "bc",
		pubKeyHash: 0x00,
		scriptHash: 0x05,
		wif: 0x80,
	},
	regtest: {
		bech32: "bcrt",
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef,
	},
}[PUBLIC_NETWORK];

export const address = writable();
export const key = writable();
export const enc = writable();

export const uncompressedAddress = (privateKey) => {
	const pubkey = secp256k1.getPublicKey(privateKey, false);
	const hash = ripemd160(sha256(pubkey));
	return base58check.encode(new Uint8Array([network.pubKeyHash, ...hash]));
};

// possible addresses for a key, ordered by preference
export const candidates = (wif) => {
	const { privateKey, compressed } = WIF.decode(wif, network.wif);
	return compressed
		? [
				{ label: "Segwit", address: btc.getAddress("wpkh", privateKey, network) },
				{ label: "Legacy", address: btc.getAddress("pkh", privateKey, network) },
			]
		: [{ label: "Legacy", address: uncompressedAddress(privateKey) }];
};

export const parse = (text) => {
	if (validate(text)) {
		address.set(text);
		goto(`/address/${text}`);
		return;
	}

	if (text.startsWith("6")) {
		enc.set(text);
		goto("/decrypt");
		return;
	}

	try {
		address.set(candidates(text)[0].address);
		key.set(text);
		goto(`/spend`);
	} catch (e) {}
};

export const focus = (el) =>
	browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);
