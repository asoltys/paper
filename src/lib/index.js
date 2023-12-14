import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';
import validate from 'bitcoin-address-validation';
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
import * as btc from '@scure/btc-signer';

export let api = PUBLIC_EXPLORER;
export let network = {
	bitcoin: {
		bech32: 'bc',
		pubKeyHash: 0x00,
		scriptHash: 0x05,
		wif: 0x80
	},
	regtest: {
		bech32: 'bcrt',
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef
	}
}[PUBLIC_NETWORK];

export let address = writable();
export let key = writable();
export let enc = writable();

export let parse = (text) => {
	if (validate(text)) {
		address.set(text);
		goto(`/address/${text}`);
	}

	if (text.startsWith('6')) {
		enc.set(text);
		goto('/decrypt');
	}

	let isKey = false;
	try {
		address.set(btc.getAddress('pkh', btc.WIF(network).decode(text), network));
		key.set(text);
		goto(`/spend`);
	} catch (e) {
		console.log(e);
	}
};

export let focus = (el) => browser && screen.width > 1280 && setTimeout(() => el.focus(), 1);
