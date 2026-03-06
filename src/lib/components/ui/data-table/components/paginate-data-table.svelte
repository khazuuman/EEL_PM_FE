<script lang="ts">
	import Paginate from '$lib/components/ui/paginate/paginate.svelte';

	import * as Select from '$lib/components/ui/select/index.js';
	import { page } from '$app/state';
	import { createQuery } from '$lib/hooks/use-query.svelte.js';
	const { count } = $props();
	const selectedPerPage = $derived.by(() => page.url.searchParams.get('limit') || '10');
</script>

{#if count > 0}
	<div class="flex items-center justify-center gap-4">
		<div class="flex items-center gap-2 text-xs font-medium md:text-sm">
			<p>Row per page</p>
			<Select.Root
				type="single"
				value={selectedPerPage}
				onValueChange={(v) =>
					createQuery({
						keys: 'limit',
						values: v
					})}
			>
				<Select.Trigger>{selectedPerPage}</Select.Trigger>
				<Select.Content>
					<Select.Item value="10">10</Select.Item>
					<Select.Item value="20">20</Select.Item>
					<Select.Item value="50">50</Select.Item>
					<Select.Item value="100">100</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		{#if count > selectedPerPage}
			<Paginate {count} perPage={selectedPerPage} />
		{/if}
	</div>
{/if}
