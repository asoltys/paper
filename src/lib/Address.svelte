<script>
	import { onMount } from 'svelte';
	import { api, address, key, network } from '$lib';
	import * as btc from '@scure/btc-signer';

	let sats = 100000000;

	export let balance = undefined;
	export let utxos = undefined;

	onMount(async () => {
		let a = $address;
		if (!a) return;
		utxos = await fetch(`${api}/address/${a}/utxo`).then((r) => r.json());
		balance = utxos.reduce((a, b) => a + b.value, 0) / sats;

		if (!balance) {
			a = btc.getAddress('pkh', btc.WIF(network).decode($key), network);
			utxos = await fetch(`${api}/address/${a}/utxo`).then((r) => r.json());
			balance = utxos.reduce((a, b) => a + b.value, 0) / sats;
			if ($address !== a) $address = a;
		}
	});
</script>

<div class="text-center space-y-5">
	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl break-all">{$address || ''}</div>
		<!-- {#if $key}<div class="text-lg">{$key}</div>{/if} -->
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-2xl">{typeof balance === 'undefined' ? '-' : balance} BTC</div>
	</div>
</div>
