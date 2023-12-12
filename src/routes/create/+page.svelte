<script>
	import { enhance } from '$app/forms';
	export let form;
	let address, enc;
	$: if (form) ({ address, enc } = form);
	let copied, password;

	let copy = (t) => {
		copied = true;
		setTimeout(() => (copied = false), 2000);
		navigator.clipboard.writeText(t);
	};
</script>

{#if form}
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
	<form class="text-center space-y-5" method="POST" use:enhance>
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
