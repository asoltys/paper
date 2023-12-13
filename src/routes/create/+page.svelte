<script>
	import { tick } from 'svelte';
	import * as btc from '@scure/btc-signer';
	import { secp256k1 } from '@noble/curves/secp256k1';
	import bip38 from 'bip38';
	import { network } from '$lib';

	let address, enc;
	let copied, password;

	let copy = (t) => {
		copied = true;
		setTimeout(() => (copied = false), 2000);
		navigator.clipboard.writeText(t);
	};

	let submitted;
	let submit = async () => {
		submitted = true;
		await tick();
		let privkey = secp256k1.utils.randomPrivateKey();
		let pubkey = secp256k1.getPublicKey(privkey);
		address = btc.getAddress('pkh', privkey, network);
		enc = await bip38.encryptAsync(privkey, true, password);
	};
</script>

{#if submitted}
	<div>
		<div class="text-gray-400">Address</div>
		<button type="button" on:click={() => copy(address)}>{address}</button>
		{#if copied}
			Copied!
		{/if}
	</div>
	<div>
		<div class="text-gray-400">Key</div>
		<div>
			<a href={`/decrypt/${enc}`}>{enc}</a>
		</div>
	</div>
{:else}
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
