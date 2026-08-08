<script>
	import { onMount } from 'svelte';
  import { decryptAsync } from '@asoltys/bip38';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { address, candidates, enc, key, network } from '$lib';
	import Password from '$lib/Password.svelte';
	import * as WIF from 'wif';

	let password;
	let submitting;

	let submit = async () => {
		submitting = true;
		let r = await decryptAsync($enc, password);
		$key = WIF.encode({
			version: network.wif,
			privateKey: r.privateKey,
			compressed: r.compressed
		});
		$address = candidates($key)[0].address;
		goto('/spend');
	};

	onMount(() => {
		if (!$enc) goto('/');
	});
</script>

{#if !submitting}
	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
		<div>
			<div class="text-gray-400">Encrypted Key</div>
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
