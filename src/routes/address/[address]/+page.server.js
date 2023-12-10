const sats = 100000000;

export async function load({ params: { address } }) {
	let r = await fetch(`https://blockstream.info/api/address/${address}/utxo`).then((r) => r.json());
	return { address, balance: r.reduce((a, b) => a + b.value, 0) / sats };
}