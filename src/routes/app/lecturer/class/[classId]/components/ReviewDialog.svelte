<!-- ApproveRejectDialog.svelte -->
<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Label } from "$lib/components/ui/label";
    import {
        CheckIcon,
        XIcon,
        LayersIcon,
        GraduationCapIcon,
    } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";

    type ActionType = "approve" | "reject";
    type TargetType = "group" | "topic";

    interface Props {
        open: boolean;
        target: TargetType; // "group" | "topic"
        action: ActionType; // "approve" | "reject"
        targetName?: string; // tên group hoặc tên topic
        groupId?: string | number;
        topicId?: string | number;
        onSuccess?: () => void;
    }

    let {
        open = $bindable(),
        target,
        action,
        targetName = "",
        groupId,
        topicId,
        onSuccess,
    }: Props = $props();

    let note = $state("");
    let isSubmitting = $state(false);

    // Reset note khi đóng dialog
    $effect(() => {
        if (!open) note = "";
    });

    const isApprove = $derived(action === "approve");

    const config = $derived(
        {
            group: {
                icon: LayersIcon,
                label: "Group",
                actionPath: "?/reviewGroup",
                idField: "groupId",
                idValue: groupId,
            },
            topic: {
                icon: GraduationCapIcon,
                label: "Topic",
                actionPath: "?/reviewTopic",
                idField: "topicId",
                idValue: topicId,
            },
        }[target],
    );

    const handleEnhance: SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error((result.data as any)?.message ?? "Action failed");
                await update();
            } else if (result.type === "success") {
                toast.success(
                    isApprove
                        ? `${config.label} approved successfully!`
                        : `${config.label} rejected successfully!`,
                );
                await onSuccess?.();
                open = false;
            }
        };
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-md bg-white p-0 gap-0 overflow-hidden">
        <!-- Header -->
        <div
            class={`px-6 pt-6 pb-5 border-b border-gray-100 ${
                isApprove ? "bg-green-50" : "bg-red-50"
            }`}
        >
            <div class="flex items-center gap-3">
                <span
                    class={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                        isApprove
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {#if isApprove}
                        <CheckIcon class="h-5 w-5" />
                    {:else}
                        <XIcon class="h-5 w-5" />
                    {/if}
                </span>
                <div>
                    <Dialog.Title class="text-base font-bold text-gray-900">
                        {isApprove ? "Approve" : "Reject"}
                        {config.label}
                    </Dialog.Title>
                    <Dialog.Description class="text-sm text-gray-500 mt-0.5">
                        {#if targetName}
                            <span class="font-medium text-gray-700"
                                >"{targetName}"</span
                            >
                        {/if}
                    </Dialog.Description>
                </div>
            </div>
        </div>

        <!-- Body -->
        <form
            method="POST"
            action={config.actionPath}
            use:enhance={handleEnhance}
        >
            <input type="hidden" name={config.idField} value={config.idValue} />
            <input type="hidden" name="isApproved" value={isApprove} />

            <div class="px-6 py-5 space-y-4">
                <!-- Note field: bắt buộc nếu reject, optional nếu approve -->
                <div class="space-y-2">
                    <Label class="text-sm font-semibold text-gray-700">
                        {isApprove ? "Note" : "Reason for rejection"}
                        <span class="text-gray-400 font-normal ml-1"
                            >(optional)</span
                        >
                    </Label>
                    <Textarea
                        name="note"
                        bind:value={note}
                        placeholder={isApprove
                            ? "Add a note... (optional)"
                            : "Explain why this is being rejected... (optional)"}
                        rows={3}
                        class="resize-none text-sm border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    {#if !isApprove}
                        <p class="text-xs text-gray-400">
                            A reason is required when rejecting.
                        </p>
                    {/if}
                </div>

                <!-- Warning nếu reject -->
                {#if !isApprove}
                    <div
                        class="flex gap-2.5 rounded-lg bg-red-50 border border-red-100 px-4 py-3"
                    >
                        <XIcon class="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <p class="text-sm text-red-600">
                            This action will notify the relevant party. Are you
                            sure?
                        </p>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div
                class="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4 bg-gray-50/60"
            >
                <Button
                    type="button"
                    variant="ghost"
                    class="h-9 px-4 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                    onclick={() => (open = false)}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting || (!isApprove && !note.trim())}
                    class={`h-9 px-5 text-sm font-semibold cursor-pointer ${
                        isApprove
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                    {#if isSubmitting}
                        <span
                            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"
                        ></span>
                    {:else if isApprove}
                        <CheckIcon class="h-4 w-4 mr-1.5" />
                    {:else}
                        <XIcon class="h-4 w-4 mr-1.5" />
                    {/if}
                    Confirm {isApprove ? "Approval" : "Rejection"}
                </Button>
            </div>
        </form>
    </Dialog.Content>
</Dialog.Root>
