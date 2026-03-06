<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import {
		ChevronDownIcon,
		ChevronsUpDownIcon,
		ChevronUpIcon,
		EyeOffIcon,
		GripIcon,
		XIcon
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { createQuery, deleteQuery } from '$lib/hooks/use-query.svelte.js';
	import { getDataTableCTX } from '../ctx/data-table.ctx';
	const SORT_TYPES = {
		ASC: 'false',
		DESC: 'true',
		RESET: 'reset',
		HIDE: 'hide'
	} as const;
	let { header, activeHeaders, setActiveHeaders } = $props();
	const dataTableCtx = getDataTableCTX();
	const { allowSortHeaders, headerValues } = $derived(dataTableCtx());
	const selectedSort = $derived(page.url.searchParams.get(header));
	const handleSort = (key: string, type: (typeof SORT_TYPES)[keyof typeof SORT_TYPES]) => {
		switch (type) {
			case SORT_TYPES.ASC:
			case SORT_TYPES.DESC:
				createQuery({
					keys: ['sortBy', 'sortDescending'],
					values: [key, type]
				});
				break;
			case SORT_TYPES.RESET:
				deleteQuery(['sortBy', 'sortDescending']);
				break;
			case SORT_TYPES.HIDE:
				setActiveHeaders(activeHeaders.filter((col: string) => col !== key));

				deleteQuery(['sortBy', 'sortDescending']);
				break;
		}
	};
</script>

{#snippet getSortIcon(sortType: string | null)}
	{@const icons = {
		[SORT_TYPES.ASC]: ChevronUpIcon,
		[SORT_TYPES.DESC]: ChevronDownIcon,
		[SORT_TYPES.HIDE]: EyeOffIcon,
		[SORT_TYPES.RESET]: XIcon
	}}
	{@const Icon = icons[sortType as keyof typeof icons] || ChevronsUpDownIcon}
	<Icon class="h-4 w-4" />
{/snippet}

<div class="flex h-full w-full items-center justify-center">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger tabindex={-1} class="z-10 h-full flex-1 px-2 py-4">
			<button
				class={`${
					header === 'id' ? 'uppercase' : 'first-letter:capitalize'
				} flex h-full w-full items-center justify-center gap-2 focus:outline-none`}
				tabindex={-1}
			>
				{headerValues[header]}
				{#if allowSortHeaders.includes(header)}
					{@render getSortIcon(selectedSort)}
				{/if}
			</button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Group>
				{#if allowSortHeaders.includes(header)}
					<DropdownMenu.Item class="capitalize" onclick={() => handleSort(header, SORT_TYPES.ASC)}>
						{@render getSortIcon(SORT_TYPES.ASC)}
						{'Increase'}
					</DropdownMenu.Item>
					<DropdownMenu.Item class="capitalize" onclick={() => handleSort(header, SORT_TYPES.DESC)}>
						{@render getSortIcon(SORT_TYPES.DESC)}
						{'Decrease'}
					</DropdownMenu.Item>
				{/if}
				<DropdownMenu.Item class="capitalize" onclick={() => handleSort(header, SORT_TYPES.HIDE)}>
					{@render getSortIcon(SORT_TYPES.HIDE)}
					{'Hide column'}
				</DropdownMenu.Item>
				{#if selectedSort}
					<DropdownMenu.Item
						class="capitalize"
						onclick={() => handleSort(header, SORT_TYPES.RESET)}
					>
						{@render getSortIcon(SORT_TYPES.RESET)}
						{'Default sort'}
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<button tabindex={-1} class="h-full w-max cursor-move px-2">
		<GripIcon class="size-4" />
	</button>
</div>
