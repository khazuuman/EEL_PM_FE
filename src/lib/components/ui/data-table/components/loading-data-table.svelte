<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	const { rows, columns } = $props();
</script>

<div class="relative rounded-md border">
	<Table.Root>
		<!-- Table Header with Skeleton -->
		<Table.Header class="bg-muted/50">
			<Table.Row>
				<Table.Head class="max-w-8">
					<Skeleton class="m-auto size-5 rounded" />
				</Table.Head>

				<!-- Dynamic Header Columns -->
				{#each Array(columns) as _}
					<Table.Head class="px-2 py-3.5">
						<Skeleton class={`m-auto h-5 w-20`} />
					</Table.Head>
				{/each}

				<Table.Head class="max-w-8">
					<Skeleton class="m-auto size-5 rounded" />
				</Table.Head>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			{#each Array(rows) as _}
				<Table.Row>
					<Table.Cell class="max-w-8">
						<Skeleton class="m-auto size-5 rounded" />
					</Table.Cell>

					<!-- Data Columns -->
					{#each Array(columns) as _}
						<Table.Cell class="px-2 py-6">
							<Skeleton class={`m-auto h-5 w-24`} />
						</Table.Cell>
					{/each}
					<Table.Cell class="max-w-8">
						<Skeleton class="m-auto size-5 rounded" />
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
