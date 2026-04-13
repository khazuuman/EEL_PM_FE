<script lang="ts">
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { actions, setActions, updateActions } from "$lib/stores/actions";
	const handleAction = async () => {
		updateActions((current) => {
			return { ...current, active: false };
		});

		await $actions.cb();

		setActions({
			active: false,
			description: "",
			cb: () => {},
		});
	};
</script>

{#if $actions.active}
	<AlertDialog.Root
		open={$actions.active}
		onOpenChange={() =>
			updateActions((current) => {
				return { ...current, active: false, description: "" };
			})}
	>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					{$actions.description}
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action type="button" onclick={handleAction}
					>Continue</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
