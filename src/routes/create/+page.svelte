<script>
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import * as btc from '@scure/btc-signer';
	import { secp256k1 } from '@noble/curves/secp256k1';
	import { encryptAsync } from '@asoltys/bip38';
	import { address, enc, focus, network, uncompressedAddress } from '$lib';

	let password;
	let type = 'wpkh';

	let types = {
		wpkh: 'Segwit (bc1...)',
		pkh: 'Legacy (1...)',
		uncompressed: 'Legacy uncompressed (1...)'
	};

	let submitted;
	let submit = async () => {
		submitted = true;
		await tick();
		let privkey = secp256k1.utils.randomPrivateKey();
		let compressed = type !== 'uncompressed';

		$address =
			type === 'uncompressed'
				? uncompressedAddress(privkey)
				: btc.getAddress(type, privkey, network);
		$enc = await encryptAsync(privkey, compressed, password);

		goto('/created');
	};
</script>

<form class="text-center space-y-5" on:submit|preventDefault={submit}>
	<div>
		<div class="text-gray-400">Address type</div>
		<select bind:value={type} class="text-2xl bg-white p-4 rounded-2xl">
			{#each Object.keys(types) as t}
				<option value={t}>{types[t]}</option>
			{/each}
		</select>
	</div>

	<div>
		<div class="text-gray-400">Password</div>
		<input
			use:focus
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
