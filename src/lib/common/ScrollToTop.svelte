<script lang="ts">
	import { ChevronUpIcon } from '@lucide/svelte';

	let showButton = false;

	const handleScroll = () => {
		showButton = window.scrollY > 200;
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
</script>

<svelte:window on:scroll={handleScroll} />
<!-- Đặt đâu đó gần cuối layout/page -->
{#if showButton}
	<button
		type="button"
		class="bg-primary fixed right-2 bottom-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg"
		on:click={scrollToTop}
	>
		<ChevronUpIcon class="size-6 text-white" />
	</button>
{/if}
