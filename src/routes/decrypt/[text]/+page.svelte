<script>
	import * as btc from '@scure/btc-signer';
	import bip38 from 'bip38';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { network } from '$lib';

	let submitting;
	let submit = async () => {
		submitting = true;
		let { text } = $page.params;
		let r = await bip38.decryptAsync(text, password);
		let key = btc.WIF(network).encode(r.privateKey);
		goto(`/key/${key}`);
	};

	let password;
</script>

{#if !submitting}
	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
		<div>
			<div class="text-gray-400">Password</div>
			<input
				name="password"
				class="text-2xl p-4 rounded-2xl"
				placeholder="Password"
				bind:value={password}
			/>
		</div>

		<button
			type="submit"
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Submit</div>
		</button>
	</form>
{/if}
