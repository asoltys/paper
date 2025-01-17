<script>
	import { onMount } from 'svelte';
	import { api, address, key, network } from '$lib';
	import * as btc from '@scure/btc-signer';

	import * as secp256k1 from '@noble/secp256k1';
	import { sha256 } from '@noble/hashes/sha256';
	import { ripemd160 } from '@noble/hashes/ripemd160';
	import { createBase58check } from '@scure/base';
	import * as WIF from 'wif';

	const base58check = createBase58check(sha256);

	function wifToUncompressedAddress(wif) {
		const decodedWif = base58check.decode(wif);
		const uncompressedPubKey = secp256k1.getPublicKey(WIF.decode(wif).privateKey, false);
		const pubKeyHash = ripemd160(sha256(uncompressedPubKey));
		const prefixedPubKeyHash = new Uint8Array([0x00, ...pubKeyHash]);
		const uncompressedAddress = base58check.encode(prefixedPubKeyHash);

		return uncompressedAddress;
	}

	let sats = 100000000;

	export let balance = undefined;
	export let utxos = undefined;

	onMount(async () => {
		let a = $address;
		if (!a) return;
		utxos = await fetch(`${api}/address/${a}/utxo`).then((r) => r.json());
		balance = utxos.reduce((a, b) => a + b.value, 0) / sats;

		if (!balance) {
			a = wifToUncompressedAddress($key);
			//a = btc.getAddress('pkh', btc.WIF(network).decode($key), network);
			utxos = await fetch(`${api}/address/${a}/utxo`).then((r) => r.json());
			balance = utxos.reduce((a, b) => a + b.value, 0) / sats;
			if ($address !== a) $address = a;
		}
	});
</script>

<div class="text-center space-y-5">
	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl break-all">{$address || ''}</div>
		<!-- {#if $key}<div class="text-lg">{$key}</div>{/if} -->
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-2xl">{typeof balance === 'undefined' ? '-' : balance} BTC</div>
	</div>
</div>
