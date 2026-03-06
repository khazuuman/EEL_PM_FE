<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { page } from '$app/stores';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { createQuery } from '$lib/hooks/use-query.svelte.js';

	const { count, perPage } = $props();
	// Lấy page từ query string
	const currentPage = $derived(parseInt($page.url.searchParams.get('page') || '1'));

	// Per page items
</script>

<Pagination.Root class="mx-0 w-auto" {count} page={currentPage} {perPage} siblingCount={1}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton
					onclick={() => {
						const prevPage = Math.max(1, currentPage - 1);
						createQuery(
							{
								keys: 'page',
								values: String(prevPage)
							},
							false
						);
					}}
				>
					<ChevronLeftIcon class="size-4" />
					<span class="hidden sm:block">Previous</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#each pages as pageItem (pageItem.key)}
				{#if pageItem.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link
							disabled={currentPage === pageItem.value}
							page={pageItem}
							isActive={currentPage === pageItem.value}
							onclick={() =>
								createQuery(
									{
										keys: 'page',
										values: String(pageItem.value)
									},
									false
								)}
						>
							{pageItem.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton
					onclick={() => {
						const maxPage = Math.ceil(count / perPage);
						const nextPage = Math.min(maxPage, currentPage + 1);
						createQuery(
							{
								keys: 'page',
								values: String(nextPage)
							},
							false
						);
					}}
				>
					<span class="hidden sm:block">Next</span>
					<ChevronRightIcon class="size-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
