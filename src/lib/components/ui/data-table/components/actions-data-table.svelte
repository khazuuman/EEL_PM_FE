<script lang="ts">
	import { getAction } from "../data-table.helper";
	import { getDataTableCTX } from "../ctx/data-table.ctx";
	import { setActions } from "$lib/stores/actions";
	import { page } from "$app/state";
	import { enhance } from "$app/forms";
	import { setIsRootLoading } from "$lib/stores/root-loading";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import type { Snippet } from "svelte";

	type ActionType = "view" | "update" | "delete";

	let {
		id,
		actions = ["view", "update", "delete"],
		extraActions,
	}: {
		id: string;
		actions?: ActionType[];
		extraActions?: Snippet<[{ id: string }]>;
	} = $props();

	const dataTableCtx = getDataTableCTX();
	const { tableName } = $derived(dataTableCtx());
	let isSubmiting = $state(false);
	const pageUrl = $derived(page.url.pathname);
	let deleteFormEl: HTMLFormElement | null = $state(null);

	const handleEnhanceDeleteForm: SubmitFunction = () => {
		setIsRootLoading(true);
		isSubmiting = true;
		return async ({ result, update }) => {
			setIsRootLoading(false);
			isSubmiting = false;
			if (result.type === "failure") {
				toast.error(result.data?.message);
			} else if (result.type === "success") {
				await update();
			} else if (result.type === "redirect") {
				toast.success(
					`Deleted ${tableName.toLocaleLowerCase()} successfully!`,
				);
				await invalidateAll();
			}
		};
	};
</script>

<div class="flex items-center gap-1">
	{#if extraActions}
		{@render extraActions({ id })}
	{/if}

	{#each actions as action (action)}
		{@const actionConfig = getAction(action)}
		{@const Icon = actionConfig?.icon}

		{#if action === "delete"}
			<button
				disabled={isSubmiting}
				type="button"
				title={actionConfig?.label}
				onclick={() =>
					setActions({
						active: true,
						description:
							"This action cannot be undone. This will permanently delete and remove this student account from our servers.",
						cb: () => {
							if (deleteFormEl) {
								deleteFormEl.requestSubmit();
							}
						},
					})}
				class="inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-50"
			>
				{#if Icon}
					<Icon class="h-4 w-4" />
				{/if}
				<span class="sr-only">{actionConfig?.label}</span>
			</button>
		{:else}
			<a
				href={`${pageUrl}/${action === "update" ? `${id}/update` : id}?redirectTo=${encodeURIComponent(`${pageUrl}?${page.url.searchParams.toString()}`)}`}
				title={actionConfig?.label}
				class="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
			>
				{#if Icon}
					<Icon class="h-4 w-4" />
				{/if}
				<span class="sr-only">{actionConfig?.label}</span>
			</a>
		{/if}
	{/each}
</div>

{#if actions.includes("delete")}
	<form
		bind:this={deleteFormEl}
		method="POST"
		action="{pageUrl}/{id}?/delete"
		use:enhance={handleEnhanceDeleteForm}
		class="hidden"
		aria-hidden="true"
	></form>
{/if}
