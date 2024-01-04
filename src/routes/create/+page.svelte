<script>
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import * as btc from '@scure/btc-signer';
	import { secp256k1 } from '@noble/curves/secp256k1';
  import { encryptAsync } from '@asoltys/bip38';
	import { network } from '$lib';
	import { address, enc } from '$lib';

	let password;

	let submitted;
	let bm;
	let submit = async () => {
		submitted = true;
		await tick();
		let privkey = secp256k1.utils.randomPrivateKey();
		let pubkey = secp256k1.getPublicKey(privkey);

		$address = btc.getAddress('wpkh', privkey, network);
		$enc = await encryptAsync(privkey, true, password);

    goto('/created');
	};

</script>

	<form class="text-center space-y-5" on:submit|preventDefault={submit}>
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
