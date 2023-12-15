<script>
	import validate from 'bitcoin-address-validation';
	import { focus, parse } from '$lib';
  import Input from "$lib/Input.svelte"

	let value = '';
	let submit = () => parse(value);
</script>

<form class="text-center space-y-5" on:submit|preventDefault={submit}>
	<Input bind:value placeholder="Address or key" />

	<button
		type="submit"
		class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
	>
		<div class="my-auto">Submit</div>
	</button>
</form>
