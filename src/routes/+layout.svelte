<script>
	import '../app.css';
	import { api } from '$lib';
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="container mx-auto bg-gray-100 p-8 text-xl shadow-lg mt-10 rounded-2xl space-y-5">
	<div class="flex">
		<a href="/" class="text-2xl mx-auto">Bitcoin Paper Wallet</a>
	</div>

	<slot />
</div>

<div class="flex my-4">
  <a href="https://github.com/asoltys/paper" class="mx-auto">Source code</a>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(60px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-60px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			280ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			280ms cubic-bezier(0, 0, 0.2, 1) 80ms both fade-in,
			180ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>
