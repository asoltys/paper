<script>
	import * as btc from '@scure/btc-signer';
	import { api, network } from '$lib';
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { isUint8Array, hexToUint8Array, uint8ArrayToHex } from 'uint8array-extras';

	let sats = 100000000;

	let getHex = async (txid) => {
		if (isUint8Array(txid)) txid = uint8ArrayToHex(txid);
		let hex = await fetch(`${api}/tx/${txid}/hex`).then((r) => r.text());
		return hexToUint8Array(hex);
	};

	let getFeeRate = () =>
    network.bech32 === 'bcrt' ? { halfHourFee: 50 } : fetch(`${api}/v1/fees/recommended`).then((r) => r.text());

	let txid;
	let submit = async () => {
		let amount = BigInt(Math.round(decimal * sats));
		if (decimal > balance) throw new Error('insufficient funds');

		let i = 0;
		let total = 0n;
		while (total < amount) {
			total += BigInt(utxos[i].value);
			i++;
			if (i > utxos.length) throw new Error('insufficient funds');
		}

		let change = total - amount;

		let tx = new btc.Transaction();

		for await (let { input, vout, txid } of utxos.slice(0, i)) {
			tx.addInput({
				txid,
				index: vout,
				nonWitnessUtxo: await getHex(txid)
			});
		}

		tx.addOutputAddress(destination, amount, network);
		tx.addOutputAddress(address, change, network);

    let { halfHourFee: rate } = await getFeeRate();
		while (i <= utxos.length) {
			let fee = BigInt(rate) * BigInt(tx.unsignedTx.length);

			if (fee <= change) {
				let q = new btc.Transaction();
				for (let i = 0; i < tx.inputsLength; i++) {
					let input = tx.getInput(i);

					let nonWitnessUtxo = await getHex(input.txid);
					q.addInput({ ...input, nonWitnessUtxo });
				}
				q.addOutput(tx.getOutput(0));
				q.addOutputAddress(address, change - fee, network);
				tx = q;

				break;
			} else {
				if (i === utxos.length) {
					if (fee > amount) throw new Error('insufficient funds');
					else {
						let q = new btc.Transaction();
						for (let i = 0; i < tx.inputsLength; i++) {
							let input = tx.getInput(i);

							let nonWitnessUtxo = await getHex(input.txid);
							q.addInput({ ...input, nonWitnessUtxo });
						}

						q.addOutputAddress(destination, total - fee, network);

						tx = q;
						break;
					}
				}

				let { txid, vout } = utxos[++i];
				tx.addInput({
					hash: txid,
					index: vout,
					nonWitnessUtxo: await getHex(txid)
				});
			}
		}

		let privkey = btc.WIF(network).decode(key);
		for (let i = 0; i < tx.inputsLength; i++) {
			tx.signIdx(privkey, 0);
		}
		tx.finalize();

		txid = await fetch(`${api}/tx`, {
			method: 'POST',
			body: tx.hex
		}).then((r) => r.text());
	};

	export let data;

	let { address, balance, key, utxos } = data;
	$: ({ address, balance, key, utxos } = data);

	let decimal, destination;
	// let decimal = 0.01,
	// 	destination = 'bcrt1qduk6k7xqm265vhcyu9wfz92wja4hpqtdhc2vmk';
</script>

{#if txid}
	<h1 class="text-2xl text-center">Withrawal Submitted!</h1>
	<div class="break-all text-center">{txid}</div>
{:else}
	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
		<div>
			<div class="text-gray-400">Address</div>
			<div class="text-2xl">{address}</div>
		</div>

		<div>
			<div class="text-gray-400">Balance</div>
			<div class="text-4xl">{balance}</div>
		</div>

		<div>
			<div class="text-gray-400">Withdraw</div>
			<input class="text-2xl p-4 rounded-2xl" placeholder="Amount" bind:value={decimal} />
		</div>

		<div>
			<div class="text-gray-400">To</div>
			<input class="text-2xl p-4 rounded-2xl" placeholder="Address" bind:value={destination} />
		</div>

		<button
			type="submit"
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Withdraw</div>
		</button>
	</form>
{/if}
