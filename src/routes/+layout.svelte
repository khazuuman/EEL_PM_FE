<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { Toaster } from '$lib/components/ui/sonner';
	import "../app.css";
	import { navigating } from "$app/state";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	let { children } = $props();

	const isMobile = new IsMobile();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
{#if isMobile.current}
	<div class="flex min-h-screen items-center justify-center p-4">
		<div class="max-w-md text-center">
			<h1 class="mb-4 text-3xl font-bold">📱 → 💻</h1>
			<h2 class="mb-4 text-2xl font-semibold">Desktop Required</h2>
			<p class="font-bold">
				Please access this application from a tablet, laptop, or desktop
				computer for the best experience.
			</p>
		</div>
	</div>
{:else}
	{#if navigating.to}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
		>
			<div
				class="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg"
			>
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"
				></div>
				<span class="text-sm font-medium text-gray-600">Loading...</span
				>
			</div>
		</div>
	{/if}
	<!-- Your existing app code -->
	<Toaster position="top-right" richColors duration={3000} closeButton />
	{@render children()}
{/if}
