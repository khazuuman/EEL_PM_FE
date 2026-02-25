<!-- src/routes/+error.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { HouseIcon, FileQuestionMarkIcon, TriangleAlertIcon } from '@lucide/svelte';

	const status = page.status;
	const message = page.error?.message || 'Something went wrong!';

	const errorMap = {
		404: {
			label: 'Not found',
			message: `Oops! This page doesn't exist.`
		},
		403: {
			label: 'Forbidden',
			message
		},
		500: {
			label: 'Internal Server Error',
			message: 'Oops. Something went wrong!'
		}
	} as const;

	type ErrorStatus = keyof typeof errorMap; // 404 | 403 | 500

	// Chuẩn hóa status về 404/403/500, nếu không khớp thì dùng 500
	const normalizedStatus: ErrorStatus =
		(status as ErrorStatus) in errorMap ? (status as ErrorStatus) : 500;
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
	<div class="space-y-6">
		<div class="flex justify-center">
			{#if normalizedStatus === 404}
				<FileQuestionMarkIcon class="text-muted-foreground h-24 w-24 animate-bounce" />
			{:else}
				<TriangleAlertIcon class="text-destructive h-24 w-24" />
			{/if}
		</div>

		<div class="space-y-2">
			<h1 class="text-destructive text-7xl font-bold tracking-tighter">
				{normalizedStatus}
			</h1>
			<h2 class="text-2xl font-semibold tracking-tight">
				{errorMap[normalizedStatus].label}
			</h2>
			<p class="text-muted-foreground mx-auto max-w-500">
				{errorMap[normalizedStatus].message}
			</p>
		</div>

		<div class="mt-8 flex flex-wrap justify-center gap-4">
			<!-- <Button variant="outline" onclick={() => history.back()}>
				<ArrowLeft class="mr-2 h-4 w-4" /> Go back
			</Button> -->
			<Button href="/" size="lg">
				<HouseIcon class="mr-2 h-4 w-4" /> Back to home
			</Button>
		</div>
	</div>
</div>
