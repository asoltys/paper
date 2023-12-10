<script>
  export let data;
  let { address, balance } = data;
</script>

<div class="text-center space-y-5">
  <div>
<div class="text-gray-400">Address</div>
<div class="text-2xl">{address}</div>
</div>

<div>
<div class="text-gray-400">Balance</div>
<div class="text-4xl">{balance}</div>
</div>
</div>
