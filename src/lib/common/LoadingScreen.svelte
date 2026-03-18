<script lang="ts">
	import { LoaderIcon } from '@lucide/svelte';
</script>

<div
	class="bg-background/80 text-primary fixed inset-0 z-9999 flex flex-col items-center justify-center gap-6 backdrop-blur-sm"
>
	<div class="flex items-center gap-6">
		<LoaderIcon class="animate-spin-slow size-16" />
	</div>
	<p class="text-4xl font-bold">
		Loading
		<span class="animate-pulse-delay-0 text-6xl">.</span>
		<span class="animate-pulse-delay-1 text-6xl">.</span>
		<span class="animate-pulse-delay-2 text-6xl">.</span>
	</p>
</div>

<style>
	/* Slow spin animation - 2s thay vì 1s mặc định */
	:global(.animate-spin-slow) {
		animation: spin 1.5s linear infinite;
	}

	/* Pulse với delay khác nhau cho mỗi dấu chấm */
	:global(.animate-pulse-delay-0) {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		animation-delay: 0s;
	}

	:global(.animate-pulse-delay-1) {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		animation-delay: 0.3s;
	}

	:global(.animate-pulse-delay-2) {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		animation-delay: 0.6s;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
</style>
