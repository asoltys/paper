import bip38 from 'bip38';
import { networks } from 'bitcoinjs-lib';
import wif from 'wif';
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

let network = networks[PUBLIC_NETWORK];

export const actions = {
	default: async ({ params: { text }, request }) => {
		let form = await request.formData();
		let password = form.get('password');
		let r = await bip38.decrypt(text, password);
    console.log(r)
		let key = wif.encode(network.wif, r.privateKey, r.compressed);
		throw redirect(307, `/key/${key}`);
	}
};
