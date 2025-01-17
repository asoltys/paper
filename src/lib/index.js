import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { PUBLIC_EXPLORER, PUBLIC_NETWORK } from "$env/static/public";
import * as btc from "@scure/btc-signer";
import validate from "bitcoin-address-validation";
import { writable } from "svelte/store";
import * as WIF from "wif";

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

export const parse = (text) => {
	if (validate(text)) {
		address.set(text);
		goto(`/address/${text}`);
	}

	if (text.startsWith("6")) {
		enc.set(text);
		goto("/decrypt");
	}

	const isKey = false;
	const decoded = WIF.decode(text);
	try {
		address.set(btc.getAddress("pkh", decoded.privateKey, network));
		key.set(text);
		goto(`/spend`);
	} catch (e) {}
};

export const focus = (el) =>
	browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);
