<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { Toaster } from "svelte-sonner";
	import "../app.css";
	import { navigating } from "$app/state";
	let { children } = $props();
</script>

<!-- ✅ Kiểm tra navigating.to thay vì navigating -->
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
			<span class="text-sm font-medium text-gray-600">Loading...</span>
		</div>
	</div>
{/if}

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<Toaster richColors position="top-right" />
{@render children()}
