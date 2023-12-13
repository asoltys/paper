import * as btc from '@scure/btc-signer';
import { redirect } from '@sveltejs/kit';
import { api, network } from '$lib';

let sats = 100000000;

let getUtxos = (address) => {
	return fetch(`${api}/address/${address}/utxo`).then((r) => r.json());
};

export async function load({ params: { key } }) {
	let address = btc.getAddress('pkh', btc.WIF(network).decode(key), network);
	let utxos = await getUtxos(address);
  let balance = utxos.reduce((a, b) => a + b.value, 0) / sats;
    return { address, balance, key, utxos };
}
