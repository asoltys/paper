<script>
	import { api, address, key } from '$lib';

	let sats = 100000000;

	export let balance = undefined;
	export let utxos = undefined;

	address.subscribe(async (a) => {
		if (!a) return;
		utxos = await fetch(`${api}/address/${a}/utxo`).then((r) => r.json());
		balance = utxos.reduce((a, b) => a + b.value, 0) / sats;
	});
</script>

<div class="text-center space-y-5">
	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl">{$address || ''}</div>
		<!-- {#if $key}<div class="text-lg">{$key}</div>{/if} -->
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-2xl">{typeof balance === 'undefined' ? '-' : balance} BTC</div>
	</div>
</div>
