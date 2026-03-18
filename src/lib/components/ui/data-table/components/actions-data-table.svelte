<script lang="ts">
	import { getAction } from '../data-table.helper';
	import {
		DropdownMenu,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuContent,
		DropdownMenuTrigger,
		DropdownMenuItem
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { MoreHorizontalIcon } from '@lucide/svelte';
	import { getDataTableCTX } from '../ctx/data-table.ctx';
	import { setActions } from '$lib/stores/actions';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { setIsRootLoading } from '$lib/stores/root-loading';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	let { id, showView } = $props();
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
			if (result.type === 'failure') {
				toast.error(result.data?.message);
			} else if (result.type === 'success') {
				await update();
			} else if (result.type === 'redirect') {
				toast.success(`Deleted ${tableName.toLocaleLowerCase()} successfully!`);
				await invalidateAll();
			}
		};
	};
	
	const actions = showView as string[] ? ['view', 'update', 'delete'] : ['update', 'delete']
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button tabindex={-1} variant="ghost" class="h-8 w-8 p-0">
			<MoreHorizontalIcon />
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuLabel>{'Actions'}</DropdownMenuLabel>
		<DropdownMenuSeparator />
		{#each actions as action (action)}
			{@const actionConfig = getAction(action)}
			{@const Icon = actionConfig?.icon}
			{#if action === 'delete'}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					class="bg-destructive data-highlighted:bg-destructive/80 cursor-pointer text-white data-highlighted:text-white"
				>
					<button
						disabled={isSubmiting}
						type="button"
						onclick={() =>
							setActions({
								active: true,
								description:
									'This action cannot be undone. This will permanently delete and remove this student account from our servers.',
								cb: () => {
                                    console.log("cb called, deleteFormEl:", deleteFormEl);
									if (deleteFormEl) {
										deleteFormEl.requestSubmit();
									}
								}
							})}
						class="flex items-center gap-2"
					>
						{#if Icon}
							<Icon class="h-4 w-4 text-white" />
						{/if}
						{actionConfig?.label}
					</button>
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem>
					<a
						href={`${pageUrl}/${action === 'update' ? `${id}/update` : id}?redirectTo=${encodeURIComponent(`${pageUrl}?${page.url.searchParams.toString()}`)}`}
						class="flex items-center gap-2"
					>
						{#if Icon}
							<Icon class="h-4 w-4" />
						{/if}
						{actionConfig?.label}
					</a>
				</DropdownMenuItem>
			{/if}
		{/each}
	</DropdownMenuContent>
</DropdownMenu>

<form
	bind:this={deleteFormEl}
	method="POST"
	action="{pageUrl}/{id}?/delete"
	use:enhance={handleEnhanceDeleteForm}
	class="hidden"
	aria-hidden="true"
></form>
