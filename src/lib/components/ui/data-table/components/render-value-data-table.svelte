<script lang="ts">
	import { formatIfDate } from '$lib/utils/date-format';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { getDataTableCTX } from '../ctx/data-table.ctx';
	// import { renderIcons } from '$lib/constrants';

	const { header, value } = $props();
	const dataTableCtx = getDataTableCTX();
	let { statuses } = $derived(dataTableCtx());
	const boldValue = $state(['skill', 'part']);
</script>

<!-- {#snippet renderIcon(value: string)}
	{@const Icon = renderIcons(value)}
	<Icon class="size-5" />
{/snippet} -->

{#if ['createdAt', 'updatedAt', 'deletedAt', 'bannedAt', 'deadline'].includes(header)}
	<p>{formatIfDate(value, 'date-only')}</p>
{:else if ['startTime', 'endTime'].includes(header)}
	<p>{formatIfDate(value, 'full')}</p>
{:else if ['status', 'difficultyLevel', 'submissionStatus', 'assignmentStatus', 'isActive'].includes(header)}
	{@const curStatusIndex = statuses.findIndex((s) => s.value === value.toString())}
	<Badge
		variant={statuses?.[curStatusIndex]?.variant as
			| 'default'
			| 'secondary'
			| 'destructive'
			| 'outline'
			| 'active'
			| 'pending'
			| 'warn'
			| undefined}
		class="px-6 py-1 font-bold"
	>
		{statuses?.[curStatusIndex]?.label}
	</Badge>
{:else}
	<div class="flex items-center justify-start gap-3" title={value}>
		<!-- {#if value && typeof value === 'string'}
			{@render renderIcon(value.toLowerCase())}
		{/if} -->
		<p class={'max-w-48 truncate' + (boldValue.includes(header) ? 'font-medium' : '')}>
			{value}
		</p>
	</div>
{/if}
