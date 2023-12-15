<script>
	import { onMount } from 'svelte';
	import * as btc from '@scure/btc-signer';
	import bip38 from 'bip38';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { address, enc, key, network } from '$lib';
	import Password from '$lib/Password.svelte';

	let password;
	let submitting;

	let submit = async () => {
		submitting = true;
		let r = await bip38.decryptAsync($enc, password);
		$address = btc.getAddress('pkh', r.privateKey, network);
		$key = btc.WIF(network).encode(r.privateKey);
		goto('/spend');
	};

	onMount(() => {
		if (!$enc) goto('/');
	});
</script>

{#if !submitting}
	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
		<div>
			<div class="text-gray-400">Decrypting Key</div>
			<div class="text-2xl break-all">{$enc}</div>
		</div>

		<Password bind:password />
		<button
			type="submit"
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Submit</div>
		</button>
	</form>
{/if}
