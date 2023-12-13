// place files you want to import through the `$lib` alias in this folder.
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';

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
