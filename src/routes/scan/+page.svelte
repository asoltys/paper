<script>
	import QrScanner from 'qr-scanner';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let back = () => browser && (history.length ? history.go(-1) : goto('/'));

	let scanner, vid;
	onMount(() => {
		scanner = new QrScanner(
			vid,
			({ data }) => scanner.stop() || goto(`/parse/${encodeURI(data)}`),
			{
				highlightScanRegion: true,
				highlightCodeOutline: true
			}
		);
		scanner.start();
	});

	onDestroy(() => scanner?.stop());
</script>

<div class="flex w-full mb-4 px-4">
	<div class="bg-white mx-auto rounded-3xl">
		<video
			bind:this={vid}
			class="border-4 rounded-3xl border-white md:max-w-[600px] !max-h-[80vh] !min-w-[300px] shadow-lg"
		/>
	</div>
</div>

<div class="flex w-full mb-4">
	<button class="mx-auto border p-4 rounded-2xl bg-white" on:click={back}> Cancel </button>
</div>

<style>
	video {
		transition: transform 0.1s ease-out;
		transform: scale(1);
	}
</style>
