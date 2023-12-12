import { networks, payments } from 'bitcoinjs-lib';
import bip38 from 'bip38';
import * as ecc from '@bitcoinerlab/secp256k1';
import { ECPairFactory } from 'ecpair';
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';

let ECPair = ECPairFactory(ecc);
let network = networks[PUBLIC_NETWORK];

export const actions = {
	default: async ({ request }) => {
		let key = ECPair.makeRandom(network);
		let { address } = payments.p2pkh({
			pubkey: key.publicKey,
			network
		});

		let form = await request.formData();
		let password = form.get('password');

		let enc = await bip38.encryptAsync(key.privateKey, true, password);
		return { address, enc };
	}
};
