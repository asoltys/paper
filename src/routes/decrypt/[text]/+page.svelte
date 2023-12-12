<script>
	import bip38 from 'bip38';
	import { networks } from 'bitcoinjs-lib';
	import wif from 'wif';
	import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import 'setimmediate';

	let network = networks[PUBLIC_NETWORK];

	let submit = async () => {
		let { text } = $page.params;
		let r = await bip38.decryptAsync(text, password, progress);
		let key = wif.encode(network.wif, r.privateKey, r.compressed);
		goto(`/key/${key}`);
	};

	let password;

	let percent = 0;
	let progress = (status) => {
		({ percent } = status);
	};
</script>

{#if percent && percent < 99}
	<div class="w-full bg-white rounded-full h-2.5">
		<div
			class="bg-gray-400 h-2.5 rounded-full transition-all ease-in-out duration-300"
			style="width: {percent}%"
		></div>
	</div>
{/if}

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
			disabled={!!percent}
			class:text-gray-300={!!percent}
		class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
	>
		<div class="my-auto">Submit</div>
	</button>
</form>
