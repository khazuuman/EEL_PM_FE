<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeftIcon, RotateCcwIcon, AlertCircleIcon } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    import LogoUploader from "../components/LogoUploader.svelte";
    import TopicFormFields from "../components/TopicFormFields.svelte";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const topic = data.currentTopic;

    let logoUrl = $state(topic?.logoUrl ?? "");
    let previewUrl = $state(topic?.logoUrl ?? "");
    let isUploading = $state(false);

    function makeEnhancer(loadingMsg: string, successMsg: string, redirectTo: string) {
        return () => {
            const toastId = toast.loading(loadingMsg);
            return async ({ result, update }: any) => {
                if (result.type === "success") {
                    toast.success(successMsg, { id: toastId });
                    await invalidateAll();
                    await goto(redirectTo);
                } else {
                    const msg =
                        result.type === "failure"
                            ? ((result.data?.message as string) ?? "An error occurred")
                            : "An unexpected error occurred";
                    toast.error(msg, { id: toastId });
                    await update();
                }
            };
        };
    }
</script>

<div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex-none px-8 pt-6 pb-5 border-b border-stone-100">
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <Button
                    variant="ghost"
                    onclick={() => goto("/app/student")}
                    class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 px-2 py-1.5 h-auto cursor-pointer"
                >
                    <ArrowLeftIcon class="w-4 h-4" />
                    <span class="text-sm font-medium">Back</span>
                </Button>
                <span class="text-stone-200">/</span>
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <RotateCcwIcon class="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">Topic</p>
                        <h1 class="text-lg font-extrabold text-stone-900 leading-tight">Resubmit Topic</h1>
                    </div>
                </div>
            </div>

            <Button
                form="resubmit-topic-form"
                type="submit"
                disabled={isUploading}
                class="gap-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 cursor-pointer"
            >
                <RotateCcwIcon class="w-4 h-4" />
                Resubmit Topic
            </Button>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto min-h-0 px-8 py-6 flex flex-col gap-6">

        <!-- Rejection reason banner -->
        {#if topic?.reviewComment}
            <div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircleIcon class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <p class="text-sm font-semibold text-red-600 mb-0.5">Rejection Reason</p>
                    <p class="text-sm text-red-500 leading-relaxed">{topic.reviewComment}</p>
                </div>
            </div>
        {/if}

        <form
            id="resubmit-topic-form"
            method="POST"
            action="?/resubmitTopic"
            use:enhance={makeEnhancer(
                "Resubmitting topic...",
                "Topic resubmitted successfully!",
                "/app/student",
            )}
        >
            <input type="hidden" name="groupId" value={data.groupId} />
            <input type="hidden" name="logoUrl" value={logoUrl} />

            <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <!-- Form Fields — pre-fill từ topic cũ -->
                <div class="xl:col-span-8 flex flex-col gap-6">
                    <TopicFormFields
                        title={topic?.title}
                        description={topic?.description}
                        objectives={topic?.objectives ?? ""}
                        errorMessage={form?.message as string}
                    />
                </div>

                <!-- Logo Uploader -->
                <div class="xl:col-span-4 xl:sticky xl:top-6">
                    <LogoUploader bind:logoUrl bind:previewUrl />
                </div>
            </div>
        </form>
    </div>
</div>