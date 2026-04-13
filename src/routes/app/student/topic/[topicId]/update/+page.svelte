<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeftIcon, FileQuestionIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    import LogoUploader from "../components/LogoUploader.svelte";
    import TopicFormFields from "../components/TopicFormFields.svelte";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const topic = $derived(
        data.currentTopic && data.currentTopic.length > 0
            ? data.currentTopic[0]
            : null,
    );

    let logoUrl = $state(topic?.logoUrl ?? "");
    let previewUrl = $state(topic?.logoUrl ?? "");
    let isUploading = $state(false);
</script>

<!-- Guard: không có topic để update -->
{#if !topic}
    <div
        class="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white px-6"
    >
        <div class="flex max-w-md flex-col items-center gap-5 text-center">
            <div
                class="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 border border-orange-100"
            >
                <FileQuestionIcon class="h-10 w-10 text-orange-500" />
            </div>
            <div class="flex flex-col gap-2">
                <h2 class="text-2xl font-extrabold text-gray-900">
                    No topic found
                </h2>
                <p class="text-sm text-gray-500 leading-relaxed">
                    Your group has not registered a topic yet. Please register a
                    topic first before updating.
                </p>
            </div>
            <Button
                type="button"
                variant="outline"
                class="mt-4 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 cursor-pointer"
                onclick={() => history.back()}
            >
                <ArrowLeftIcon class="mr-2 h-4 w-4" />
                Go Back
            </Button>
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-white pt-4 font-sans">
        <!-- Sticky Top Bar -->
        <div
            class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
        >
            <Button
                variant="ghost"
                onclick={() => history.back()}
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
                <ArrowLeftIcon class="h-4 w-4" />
                <span class="text-sm font-semibold">Cancel</span>
            </Button>

            <Button
                form="update-topic-form"
                type="submit"
                disabled={isUploading}
                class="bg-orange-600 px-6 text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer shadow-sm"
            >
                Save
            </Button>
        </div>

        <!-- Content -->
        <div class="px-6 py-8 space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1
                    class="text-3xl font-extrabold tracking-tight text-gray-900"
                >
                    Update Topic
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    Edit the details for your graduation project topic.
                </p>
            </div>

            <form
                id="update-topic-form"
                method="POST"
                action="?/UpdateTopic"
                use:enhance={() => {
                    const toastId = toast.loading("Saving changes...");
                    return async ({ result, update }) => {
                        if (result.type === "success") {
                            toast.success("Topic updated successfully!", {
                                id: toastId,
                            });
                            history.back();
                        } else {
                            const msg =
                                result.type === "failure"
                                    ? ((result.data?.message as string) ??
                                      "Failed to update topic")
                                    : "An unexpected error occurred";
                            toast.error(msg, { id: toastId });
                            await update();
                        }
                    };
                }}
            >
                <!-- Hidden fields -->
                <input type="hidden" name="topicId" value={topic.topicId} />
                <input type="hidden" name="logoUrl" value={logoUrl} />

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    <!-- Form Fields -->
                    <div class="xl:col-span-8 flex flex-col gap-6">
                        <TopicFormFields
                            title={topic.title}
                            description={topic.description}
                            objectives={topic.objectives ?? ""}
                            errorMessage={form?.message as string}
                        />
                    </div>

                    <!-- Logo Uploader -->
                    <div class="xl:col-span-4 sticky top-24">
                        <LogoUploader
                            bind:logoUrl
                            bind:previewUrl
                        />
                    </div>
                </div>
            </form>
        </div>
    </div>
{/if}
