<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeftIcon, RefreshCwIcon, BookOpenIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type { ActionData } from "./$types";

    import LogoUploader from "../../components/LogoUploader.svelte";
    import TopicFormFields from "../../components/TopicFormFields.svelte";
    import type { PageData } from "../$types";

    let { form, data }: { form: ActionData; data: PageData } = $props();

    let logoUrl = $state("");
    let previewUrl = $state("");
    let isUploading = $state(false);
</script>

<div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex-none px-8 pt-6 pb-5 border-b border-stone-100">
        <div class="flex items-center gap-3">
            <Button
                variant="ghost"
                onclick={() => history.back()}
                class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 px-2 py-1.5 h-auto cursor-pointer"
            >
                <ArrowLeftIcon class="w-4 h-4" />
                <span class="text-sm font-medium">Back</span>
            </Button>
            <span class="text-stone-200">/</span>
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center"
                >
                    <BookOpenIcon class="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <p
                        class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none"
                    >
                        Topic
                    </p>
                    <h1
                        class="text-lg font-extrabold text-stone-900 leading-tight"
                    >
                        Change Topic Request
                    </h1>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="ml-auto flex items-center gap-2">
                <Button
                    form="change-topic-form"
                    type="submit"
                    class="gap-2 h-9 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                >
                    <RefreshCwIcon class="w-4 h-4" />
                    Submit Request
                </Button>
            </div>
        </div>
    </div>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        <!-- Info banner -->
        <div
            class="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4"
        >
            <RefreshCwIcon class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
                <p
                    class="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1"
                >
                    New Change Request
                </p>
                <p class="text-sm text-amber-800 leading-relaxed">
                    Fill in the details below to submit a new topic change
                    request for your group. Your request will be reviewed by
                    your lecturer.
                </p>
            </div>
        </div>

        <!-- Form -->
        <form
            id="change-topic-form"
            method="POST"
            action="?/ChangeTopic"
            use:enhance={() => {
                const toastId = toast.loading("Submitting change request...");
                return async ({ result, update }) => {
                    if (result.type === "success") {
                        toast.success(
                            "Change request submitted successfully!",
                            {
                                id: toastId,
                            },
                        );
                        history.back();
                    } else {
                        const msg =
                            result.type === "failure"
                                ? ((result.data?.message as string) ??
                                  "Failed to submit request")
                                : "An unexpected error occurred";
                        toast.error(msg, { id: toastId });
                        await update();
                    }
                };
            }}
        >
            <input type="hidden" name="logoUrl" value={logoUrl} />
            <input type="hidden" name="groupId" value={data.groupId} />
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <!-- Form fields -->
                <div class="xl:col-span-2 flex flex-col gap-6">
                    <TopicFormFields
                        title=""
                        description=""
                        objectives=""
                        errorMessage={form?.message as string}
                    />
                </div>

                <!-- Logo uploader -->
                <div class="xl:col-span-1 sticky top-6">
                    <LogoUploader bind:logoUrl bind:previewUrl />
                </div>
            </div>
        </form>
    </div>
</div>
