<script>
	import { onMount } from 'svelte';
	import encodeQR from '@paulmillr/qr';
	import decodeQR from '@paulmillr/qr/decode.js';
	import { Bitmap } from '@paulmillr/qr';
	import { address, enc } from '$lib';

	let addressCanvas, keyCanvas;
      let opts = { scale: 4 };

	onMount(() => {
		draw(addressCanvas, encodeQR($address, 'raw', opts));
		draw(keyCanvas, encodeQR($enc, 'raw', opts));
	});

	let draw = (canvas, bitmap) => {
		let ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;

		let w = bitmap[0].length;
		let h = bitmap.length;

		canvas.width = w;
		canvas.height = h;
		canvas.style = `image-rendering: pixelated;width: 300px; height: 300px`;

		let scale = 1;
		let img = new Uint8ClampedArray(scale * w * h * 4);
		for (let y = 0; y < bitmap.length; y++) {
			for (let x = 0; x < bitmap[y].length; x++) {
				let color = bitmap[y][x] ? 0 : 255;

				for (let dx = 0; dx < scale; dx++) {
					let i = (y * w * scale + (x * scale + dx)) * 4;
					img[i + 0] = img[i + 1] = img[i + 2] = color;
					img[i + 3] = 255;
				}
			}
		}

		let imgData = new ImageData(img, scale * w, h);
		ctx.putImageData(imgData, 0, 0);
	};
</script>

<div class="flex flex-wrap justify-center gap-8">
	<div class="text-center space-y-5 mb-auto w-[380px]">
		<div class="text-gray-400">Public address</div>
		<canvas bind:this={addressCanvas} class="mx-auto"></canvas>
		<div class="break-all"><a href={`/address/${$address}`}>{$address}</a></div>
	</div>
	<div class="text-center space-y-5 mb-auto w-[380px]">
		<div class="text-gray-400">Private key</div>
		<canvas bind:this={keyCanvas} class="mx-auto"></canvas>
		<div class="break-all"><a href="/decrypt">{$enc}</a></div>
	</div>
</div>
