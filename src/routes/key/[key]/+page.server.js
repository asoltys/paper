import { address as Address, networks, payments, Psbt } from 'bitcoinjs-lib';
import wif from 'wif';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
import { redirect } from "@sveltejs/kit";
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

let getHex = async (txid) => {
	let text = await fetch(`${PUBLIC_EXPLORER}/tx/${txid}/hex`).then((r) => r.text());
	return Buffer.from(text, 'hex');
};

let getFeeRate = () =>
	PUBLIC_NETWORK === 'regtest'
		? 50
		: fetch(`${PUBLIC_EXPLORER}/v1/fees/recommended`).then((r) => r.text());

export async function load({ params: { key } }) {
	let address = getAddress(key);
	let utxos = await getUtxos(address);
	return { address, balance: utxos.reduce((a, b) => a + b.value, 0) / sats };
}

export const actions = {
	default: async ({ params: { key }, request, url }) => {
		let form = await request.formData();
		let destination = form.get('destination');
		let amount = Math.round(form.get('amount') * sats);
		let address = getAddress(key);

		let utxos = await getUtxos(address);

		let i = 0;
		let total = 0;
		while (total < amount) {
			total += utxos[i].value;
			i++;
			if (i > utxos.length) throw new Error('insufficient funds');
		}

		let change = total - amount;

		let p = new Psbt();

		for await (let { input, vout, txid } of utxos.slice(0, i)) {
			p.addInput({
				hash: txid,
				index: vout,
				nonWitnessUtxo: await getHex(txid)
			});
		}

		p.addOutput({
			script: Address.toOutputScript(destination, network),
			value: amount
		});

		p.addOutput({
			script: Address.toOutputScript(address, network),
			value: change
		});

		let rate = await getFeeRate();
		while (i <= utxos.length) {
			let fee = rate * p.__CACHE.__TX.virtualSize();

			if (fee <= change) {
				let q = new Psbt();
				for await (let i of p.txInputs) {
					let nonWitnessUtxo = await getHex(reverse(i.hash).toString('hex'));
					q.addInput({ ...i, nonWitnessUtxo });
				}
				q.addOutput(p.txOutputs[0]);
				q.addOutput({
					script: Address.toOutputScript(address, network),
					value: change - fee
				});
				p = q;

				break;
			} else {
				if (i === utxos.length) {
					if (fee > amount) throw new Error('insufficient funds');
					else {
						let q = new Psbt();
						for await (let i of p.txInputs) {
							let nonWitnessUtxo = await getHex(reverse(i.hash).toString('hex'));
							q.addInput({ ...i, nonWitnessUtxo });
						}

						q.addOutput({
							script: Address.toOutputScript(destination, network),
							value: total - fee
						});

						p = q;
						break;
					}
				}

				let { txid, vout } = utxos[++i];
				p.addInput({
					hash: txid,
					index: vout,
					nonWitnessUtxo: await getHex(txid)
				});
			}
		}

		let hex = p
			.signAllInputs(ECPair.fromPrivateKey(Buffer.from(wif.decode(key).privateKey), network))
			.finalizeAllInputs()
			.extractTransaction()
			.toHex();

		let t = await fetch(`${PUBLIC_EXPLORER}/tx`, {
			method: 'POST',
			body: hex
		}).then((r) => r.text());

		throw redirect(303, url.pathname);
	}
};
