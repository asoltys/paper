<script>
	import { Buffer } from 'buffer';
	import { networks, payments } from 'bitcoinjs-lib';
	import bip38 from 'bip38';
	import * as ecc from '@bitcoinerlab/secp256k1';
	import { ECPairFactory } from 'ecpair';
	import { PUBLIC_NETWORK, PUBLIC_EXPLORER } from '$env/static/public';
	import 'setimmediate';

	let ECPair = ECPairFactory(ecc);
	let network = networks[PUBLIC_NETWORK];
	export let form;
	let address, enc;
	$: if (form) ({ address, enc } = form);
	let copied, password;

	let copy = (t) => {
		copied = true;
		setTimeout(() => (copied = false), 2000);
		navigator.clipboard.writeText(t);
	};

	let submit = async () => {
		let key = ECPair.makeRandom(network);

		({ address } = payments.p2pkh({
			pubkey: key.publicKey,
			network
		}));

		enc = await bip38.encryptAsync(key.privateKey, true, password, progress);
	};

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

{#if enc}
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
			disabled={!!percent}
			class:text-gray-300={!!percent}
			class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
		>
			<div class="my-auto">Submit</div>
		</button>
	</form>
{/if}
