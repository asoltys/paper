<script>
	import { focus, parse } from '$lib';
	let text;
	let submit = () => parse(text);
</script>

<form class="text-center space-y-5" on:submit|preventDefault={submit}>
	<div>
		<input
			use:focus
			name="text"
			class="text-2xl p-4 rounded-2xl w-full"
			placeholder="Address or key"
			bind:value={text}
		>
	</div>

	<button
		type="submit"
		class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
	>
		<div class="my-auto">Submit</div>
	</button>
</form>
