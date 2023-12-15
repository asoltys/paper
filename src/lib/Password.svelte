<script>
	export let password;
	let stars = true;
</script>

<div>
	<div class="text-gray-400">Password</div>

	<div class="flex justify-center gap-2">
		{#if stars}
			<input
				type="password"
				use:focus
				name="password"
				class="text-2xl p-4 rounded-2xl"
				placeholder="Password"
				bind:value={password}
			/>
		{:else}
			<input
				use:focus
				name="password"
				class="text-2xl p-4 rounded-2xl"
				placeholder="Password"
				bind:value={password}
			/>
		{/if}

		<button type="button" on:click={() => (stars = !stars)}>
			{#if stars}
				<img src="/eye-off.svg" class="w-8" />
			{:else}
				<img src="/eye.svg" class="w-8" />
			{/if}
		</button>
	</div>
</div>
