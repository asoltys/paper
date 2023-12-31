<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as btc from '@scure/btc-signer';
	import { api, address, key, network } from '$lib';
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { isUint8Array, hexToUint8Array, uint8ArrayToHex } from 'uint8array-extras';
	import Input from '$lib/Input.svelte';

	import Address from '$lib/Address.svelte';

	let balance,
		fee = 0,
		fees = {},
		inputs = [],
		outputs = [],
		rate,
		sats = 100000000,
		utxos,
		tx,
		txid;

	let feeNames = {
		fastestFee: 'Fastest',
		halfHourFee: 'Fast',
		hourFee: 'Medium',
		economyFee: 'Slow',
		minimumFee: 'Slowest'
	};

	let b = (n) => (Number(n) / sats).toFixed(8);

	onMount(async () => {
		if (!$key) goto('/');

		if (network.bech32 === 'bcrt') {
			fees = { fastestFee: 281, halfHourFee: 271, hourFee: 256, economyFee: 44, minimumFee: 22 };
		} else {
			fees = await fetch(`${api}/v1/fees/recommended`).then((r) => r.json());
		}

		rate = fees['halfHourFee'];
	});

	let getHex = async (txid) => {
		if (isUint8Array(txid)) txid = uint8ArrayToHex(txid);
		let hex = await fetch(`${api}/tx/${txid}/hex`).then((r) => r.text());
		return hexToUint8Array(hex);
	};

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

		tx = new btc.Transaction();

		for await (let { input, vout, txid } of utxos.slice(0, i)) {
			tx.addInput({
				txid,
				index: vout,
				nonWitnessUtxo: await getHex(txid),
				sequence: 0xfffffffd
			});
		}

		tx.addOutputAddress(destination, amount, network);
		tx.addOutputAddress($address, change, network);

		console.log(tx.unsignedTx.length);

		while (i <= utxos.length) {
			fee = BigInt(rate) * BigInt(tx.unsignedTx.length * 2);

			if (fee <= change) {
				let q = new btc.Transaction();
				for (let i = 0; i < tx.inputsLength; i++) {
					let input = tx.getInput(i);

					let nonWitnessUtxo = await getHex(input.txid);
					q.addInput({ ...input, nonWitnessUtxo });
				}
				q.addOutput(tx.getOutput(0));
				q.addOutputAddress($address, change - fee, network);
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

		let privkey = btc.WIF(network).decode($key);
		for (let i = 0; i < tx.inputsLength; i++) {
			tx.signIdx(privkey, 0);
			let input = tx.getInput(i);
			let utxo = input.nonWitnessUtxo.outputs[input.index];

			inputs = [
				...inputs,
				{
					address: btc.Address(network).encode(btc.OutScript.decode(utxo.script)),
					amount: b(utxo.amount)
				}
			];
		}

		outputs = tx.outputs.map((o) => ({
			address: btc.Address(network).encode(btc.OutScript.decode(o.script)),
			amount: b(o.amount)
		}));

		tx.finalize();
	};

	let broadcast = async () => {
		txid = await fetch(`${api}/tx`, {
			method: 'POST',
			body: tx.hex
		}).then((r) => r.text());
	};

	export let data;

  let decimal;
	let destination = '';

	$: max = balance || 0;

	let format = () => {
		if (decimal > max) decimal = max;
		if (decimal < 0) decimal = 0;
		decimal = parseFloat(decimal).toFixed(8);
	};

	function serialize(data) {
		return JSON.stringify(data, (key, value) =>
			typeof value === 'bigint' ? value.toString() : value
		);
	}
</script>

{#if txid}
	<div>
		<div class="text-gray-400 text-center">Txid</div>
		<div class="text-2xl break-all text-center">{txid}</div>
	</div>
{:else if tx}
	<div class="space-y-5">
		<div>
			<div class="text-gray-400 text-center">Inputs</div>
			{#each inputs as i}
				<div class="text-center">{i.address}: {i.amount}</div>
			{/each}
		</div>

		<div>
			<div class="text-gray-400 text-center">Outputs</div>
			{#each outputs as o}
				<div class="text-center">{o.address}: {o.amount}</div>
			{/each}
		</div>

		<div>
			<div class="text-gray-400 text-center">Fee</div>
			<div class="text-center">{b(fee)}</div>
		</div>

		<div>
			<div class="text-gray-400 text-center">Raw Hex</div>
			<div class="text-2xl break-all text-center">{tx.hex}</div>
		</div>


		<button
			type="button"
			on:click={broadcast}
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Broadcast</div>
		</button>
	</div>
{:else}
	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
		<Address bind:balance bind:utxos />

		<div>
			<div class="text-gray-400">Withdraw</div>
			<input
				class="text-2xl p-4 rounded-2xl w-full max-w-xl"
				placeholder="BTC"
				on:change={format}
				bind:value={decimal}
			/>
		</div>

		<div>
			<div class="text-gray-400">To</div>
			<Input bind:value={destination} placeholder="Address" />
		</div>

		<div>
			<div class="text-gray-400">Speed</div>
			<select bind:value={rate} class="text-2xl bg-white p-4 rounded-2xl w-full max-w-xl">
				{#each Object.keys(fees) as fee}
					<option value={fees[fee]}>{feeNames[fee]} - {fees[fee]} sats/vbyte</option>
				{/each}
			</select>
		</div>

		<button
			type="submit"
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Preview</div>
		</button>
	</form>
{/if}
