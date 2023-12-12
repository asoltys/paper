<script>
	import { enhance } from '$app/forms';
	export let form;
	let password;
</script>

{#if form}
	{form.address}
{/if}

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
