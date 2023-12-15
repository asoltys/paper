<script>
	import QrScanner from 'qr-scanner';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import decodeQR from '@paulmillr/qr/decode.js';
	import { parse } from '$lib';

	let back = () => browser && (history.length ? history.go(-1) : goto('/'));

	let canvas, scanner, player, overlay;

	const SLEEP_MS = 25;
	const TIMEOUT_MS = 500;

	let lastDetect = Date.now();
	let ctx;

	const getSize = (img) => ({
		width: +getComputedStyle(img).width.split('px')[0],
		height: +getComputedStyle(img).height.split('px')[0]
	});

	onMount(async () => {
		canvas = document.createElement('canvas');

		player.addEventListener('play', () => {
			const { height, width } = getSize(player);
			canvas.width = width;
			canvas.height = height;

			overlay.width = width;
			overlay.height = height;
			ctx = { context: canvas.getContext('2d'), height, width };
			overlayLoop();
		});

		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				height: window.screen.height,
				width: window.screen.width,
				facingMode: 'environment'
			}
		});

		player.srcObject = stream;
		player.play();
	});

	let res;
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const overlayLoop = async () => {
		while (true) {
			if (!(player && ctx)) {
				await sleep(200);
				continue;
			}
			const { context, width, height } = ctx;
			let ts = Date.now();
			context.drawImage(player, 0, 0, width, height);
			const data = context.getImageData(0, 0, height, width);
			try {
				res = decodeQR(data);
				parse(res);
			} catch (e) {}
			await sleep(SLEEP_MS);
		}
	};

	onDestroy(() => player?.stop());
</script>

<div class="flex w-full justify-center">
	<video
		bind:this={player}
		class="border-4 rounded-3xl border-white shadow-lg w-[600px] max-w-screen mx-auto"
	/>
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
