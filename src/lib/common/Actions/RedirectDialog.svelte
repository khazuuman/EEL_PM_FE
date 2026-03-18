<script lang="ts">
	import { goto } from '$app/navigation';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { redirectData, setRedirectData } from '$lib/stores/redirect';
	const updateRedirect = () => {
		goto($redirectData.location as string);
		setRedirectData({
			isRedirecting: false,
			location: null
		});
	};
</script>

{#if $redirectData.location}
	<AlertDialog.Root
		open={$redirectData.isRedirecting}
		onOpenChange={() =>
			setRedirectData({
				isRedirecting: false,
				location: null
			})}
	>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Do you want to navigate?</AlertDialog.Title>
				<AlertDialog.Description>
					We will redirect you to the previous page. Click Agree to navigate or No to stay.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>No</AlertDialog.Cancel>
				<AlertDialog.Action onclick={updateRedirect}>Agree</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
