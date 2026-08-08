<script>
	import { onMount } from 'svelte';
	import { api, address, candidates, key } from '$lib';

	let sats = 100000000;

	export let balance = undefined;
	export let utxos = undefined;

	let getUtxos = (a) => fetch(`${api}/address/${a}/utxo`).then((r) => r.json());

	onMount(async () => {
		if ($key) {
			for (let { address: a } of candidates($key)) {
				utxos = await getUtxos(a);
				balance = utxos.reduce((sum, u) => sum + u.value, 0) / sats;
				$address = a;
				if (balance) break;
			}
			if (!balance) $address = candidates($key)[0].address;
		} else if ($address) {
			utxos = await getUtxos($address);
			balance = utxos.reduce((sum, u) => sum + u.value, 0) / sats;
		}
	});
</script>

<div class="text-center space-y-5">
	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl break-all">{$address || ''}</div>
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-2xl">{typeof balance === 'undefined' ? '-' : balance} BTC</div>
	</div>
</div>
