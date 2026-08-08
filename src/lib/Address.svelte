<script>
	import { onMount, onDestroy } from 'svelte';
	import { address, candidates, key } from '$lib';
	import * as electrum from '$lib/electrum';
	import { fade } from 'svelte/transition';

	let sats = 100000000;

	export let balance = undefined;
	export let utxos = undefined;

	let confirmed = 0;
	let unconfirmed = 0;
	let notices = [];
	let unsubs = [];

	let b = (n) => (n / sats).toFixed(8).replace(/\.?0+$/, '');

	let notify = (text, kind) => {
		let notice = { text, kind, id: Math.random() };
		notices = [...notices, notice];
		setTimeout(() => (notices = notices.filter((n) => n.id !== notice.id)), 12000);
	};

	let refresh = async (a, announce) => {
		let [bal, u] = await Promise.all([electrum.balance(a), electrum.utxos(a)]);
		if ($address !== a) return;

		if (announce) {
			let incoming = bal.unconfirmed - unconfirmed;
			if (incoming > 0) notify(`Incoming payment: +${b(incoming)} BTC (pending)`, 'pending');
			else if (bal.confirmed > confirmed && bal.unconfirmed < unconfirmed)
				notify(`Payment confirmed: ${b(bal.confirmed - confirmed)} BTC`, 'confirmed');
		}

		confirmed = bal.confirmed;
		unconfirmed = bal.unconfirmed;
		utxos = u;
		balance = u.reduce((sum, x) => sum + x.value, 0) / sats;
	};

	let watch = (a, current) => {
		unsubs.push(
			electrum.subscribe(a, async () => {
				if ($address === a) {
					refresh(a, true);
				} else if (current && $address === current()) {
					// funds may have landed on another candidate while one with no
					// balance is shown; re-run detection
					let u = await electrum.utxos(a);
					if (u.length) {
						$address = a;
						refresh(a, true);
					}
				}
			})
		);
	};

	onMount(async () => {
		if ($key) {
			let cands = candidates($key);
			let chosen;
			for (let { address: a } of cands) {
				let u = await electrum.utxos(a);
				if (u.length) {
					chosen = a;
					break;
				}
			}
			chosen ||= cands[0].address;
			$address = chosen;
			await refresh(chosen);
			for (let { address: a } of cands) watch(a, () => chosen);
		} else if ($address) {
			await refresh($address);
			watch($address);
		}
	});

	onDestroy(() => {
		for (let u of unsubs) u();
	});
</script>

<div class="text-center space-y-5">
	{#each notices as notice (notice.id)}
		<div
			transition:fade
			class="mx-auto max-w-xl p-3 rounded-2xl border text-lg {notice.kind === 'confirmed'
				? 'bg-green-50 border-green-300 text-green-800'
				: 'bg-amber-50 border-amber-300 text-amber-800'}"
		>
			{notice.text}
		</div>
	{/each}

	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl break-all">{$address || ''}</div>
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-2xl">
			{typeof balance === 'undefined' ? '-' : confirmed / sats} BTC
		</div>
		{#if unconfirmed > 0}
			<div class="text-amber-600" transition:fade>+{b(unconfirmed)} BTC pending</div>
		{:else if unconfirmed < 0}
			<div class="text-amber-600" transition:fade>{b(unconfirmed)} BTC outgoing</div>
		{/if}
	</div>
</div>
