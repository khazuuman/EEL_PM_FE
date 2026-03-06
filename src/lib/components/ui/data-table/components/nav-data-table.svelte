<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronDownIcon, Settings2Icon, XIcon } from '@lucide/svelte';
	import { Input } from '../../input/index.js';
	import { createQuery, resetQuery } from '$lib/hooks/use-query.svelte.js';
	import { page } from '$app/state';
	import { getDataTableCTX } from '../ctx/data-table.ctx.js';
	import debounce from 'lodash/debounce.js';
	import { onMount } from 'svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	let { activeHeaders, setActiveHeaders } = $props();
	let searchValue = $state('');
	onMount(() => (searchValue = page.url.searchParams.get('searchTerm') ?? ''));
	const dataTableCtx = getDataTableCTX();
	const { filters, headerValues, defaultHeaders, matchSearchColumns, tableName } =
		$derived(dataTableCtx());
	let debounceSearch = debounce(
		(searchValue: unknown) => {
			createQuery({ keys: 'searchTerm', values: searchValue as unknown as string });
		},
		500,
		{
			leading: false,
			trailing: true,
			maxWait: 2000
		}
	);
	$effect(() => debounceSearch(searchValue));
	let allParamKeys = $derived.by(() => {
		return Array.from(page.url.searchParams.keys());
	});
</script>

<div class="flex items-center justify-between gap-4">
	<div class="flex flex-1 items-center gap-4">
		{#if matchSearchColumns && matchSearchColumns.length > 0}
			<Input
				bind:value={searchValue}
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						(e.target as HTMLInputElement).blur();
					}
				}}
				placeholder={`Search by ${matchSearchColumns
					.map((v) => headerValues[v])
					.join('/')
					.toLowerCase()}`}
				class="h-max py-2 xl:max-w-sm"
			/>
		{/if}
		{#if filters && filters.length > 0}
			{#each filters as filter}
				<Select.Root
					type="single"
					onValueChange={(v) =>
						createQuery({
							keys: filter.key,
							values: v
						})}
				>
					{@const titleParam = page.url.searchParams.get(filter.key)}
					{@const filterData = filter.data.find((d) => d.value === titleParam)}
					<Select.Trigger class="w-fit capitalize"
						>{filterData ? filterData.label : filter.title}</Select.Trigger
					>
					<Select.Content>
						{#each filter.data as d}
							<Select.Item class="capitalize" value={d.value}>{d.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/each}
		{/if}
		{#if allParamKeys.length > 1}
			<Button
				class="w-full xl:w-auto"
				variant={'destructive'}
				onclick={() => {
					resetQuery();
					searchValue = '';
				}}
			>
				<XIcon />
				Reset filter
			</Button>
		{/if}
	</div>
	<div class="flex items-center gap-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">
						<Settings2Icon />
						{'Columns'}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Group>
					{#each defaultHeaders as header}
						<DropdownMenu.CheckboxItem
							checked={activeHeaders.includes(header)}
							onCheckedChange={(checked) => {
								const newActiveHeaders = checked
									? header === 'id'
										? [header, ...activeHeaders]
										: [...activeHeaders, header]
									: activeHeaders.filter((col: string) => col !== header);
								setActiveHeaders(newActiveHeaders);
							}}
						>
							{headerValues[header]}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<Button
			class="gap-2"
			href={`${page.url.pathname}/create?redirectTo=${encodeURIComponent(`${page.url.pathname}?${page.url.searchParams.toString()}`)}`}
		>
			<span>+ {`Add ${tableName.toLocaleLowerCase()}`}</span>
		</Button>
	</div>
</div>
