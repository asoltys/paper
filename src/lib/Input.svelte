<script>
	export let placeholder;
	export let value;

	let input;

	$: done =
		value.length === 34 || value.length === 44 || value.length === 45 || value.length === 58;

	let clear = () => {
		value = '';
		input.focus();
	};

	let paste = async () => {
		value = (await navigator.clipboard.readText()).replace(/\s/g, '');
	};
</script>

<div class="flex justify-center gap-2 max-w-xl mx-auto">
	{#if done}
		<div class="break-all text-2xl">{value}</div>
		<button type="button" on:click={clear}>
			<img src="/pencil.svg" class="w-8" />
		</button>
	{:else}
		<input
			bind:this={input}
			use:focus
			name="value"
			class="text-2xl p-4 rounded-2xl w-full"
			{placeholder}
			bind:value
		/>
		<button type="button" on:click={paste}>
			<img src="/paste.svg" class="w-8" />
		</button>
	{/if}
</div>
