<script>
	import { enhance } from '$app/forms';

	export let data;
  export let form;

	let { address, balance } = data;
	let amount = 0.01,
		destination = 'bcrt1qduk6k7xqm265vhcyu9wfz92wja4hpqtdhc2vmk';
</script>

{#if form}
  <div class="break-all">{form.hex}</div>
{/if}

<form class="text-center space-y-5" method="POST" use:enhance>
	<div>
		<div class="text-gray-400">Address</div>
		<div class="text-2xl">{address}</div>
	</div>

	<div>
		<div class="text-gray-400">Balance</div>
		<div class="text-4xl">{balance}</div>
	</div>

	<div>
		<div class="text-gray-400">Withdraw</div>
		<input
			name="amount"
			class="text-2xl p-4 rounded-2xl"
			placeholder="Amount"
			bind:value={amount}
		/>
	</div>

	<div>
		<div class="text-gray-400">To</div>
		<input
			name="destination"
			class="text-2xl p-4 rounded-2xl"
			placeholder="Destination address"
			bind:value={destination}
		/>
	</div>

	<button
		type="submit"
		href="/create"
		class="mx-auto flex gap-2 w-full md:w-60 p-4 bg-white border rounded-2xl justify-center"
	>
		<div class="my-auto">Withdraw</div>
	</button>
</form>
