import { address as Address, networks, payments, Psbt } from 'bitcoinjs-lib';
import wif from 'wif';
import * as ecc from '@bitcoinerlab/secp256k1';
import { ECPairFactory } from 'ecpair';
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import reverse from 'buffer-reverse';

let ECPair = ECPairFactory(ecc);
let sats = 100000000;
let network = networks[PUBLIC_NETWORK];

let getAddress = (key) =>
	payments.p2pkh({
		pubkey: ECPair.fromPrivateKey(Buffer.from(wif.decode(key).privateKey)).publicKey,
		network
	}).address;

let getUtxos = (address) => {
	return fetch(`${PUBLIC_EXPLORER}/address/${address}/utxo`).then((r) => r.json());
};

export async function load({ params: { key } }) {
	let address = getAddress(key);
	let utxos = await getUtxos(address);
	return { address, balance: utxos.reduce((a, b) => a + b.value, 0) / sats, key };
}
