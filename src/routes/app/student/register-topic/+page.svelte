<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import { ArrowLeftIcon, AlertCircleIcon, InfoIcon } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    // ── Shared child components ──────────────────────────────────────────────
    import LogoUploader from "./components/LogoUploader.svelte";
    import TopicFormFields from "./components/TopicFormFields.svelte";
    import { formatDate } from "date-fns";
    import { formatIfDate } from "$lib/utils/date-format";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let logoUrl = $state("");
    let previewUrl = $state("");
    let isUploading = $state(false);
    let isResubmitting = $state(false);

    function enterResubmit() {
        const topic = data.currentTopic?.[0];
        logoUrl = topic?.logoUrl ?? "";
        previewUrl = topic?.logoUrl ?? "";
        isResubmitting = true;
    }

    function makeEnhancer(
        loadingMsg: string,
        successMsg: string,
        redirectTo: string,
        onSuccess?: () => void,
    ) {
        return () => {
            const toastId = toast.loading(loadingMsg);
            return async ({ result, update }: any) => {
                if (result.type === "success") {
                    toast.success(successMsg, { id: toastId });
                    onSuccess?.();
                    await invalidateAll();
                    await goto(redirectTo);
                } else {
                    const msg =
                        result.type === "failure"
                            ? ((result.data?.message as string) ??
                              "An error occurred")
                            : "An unexpected error occurred";
                    toast.error(msg, { id: toastId });
                    await update();
                }
            };
        };
    }
</script>

<div class="min-h-screen bg-white pt-5 font-sans">
    <!-- ══════════════════════════════════════════════════════════════════════════
        GUARD: No group
    ═══════════════════════════════════════════════════════════════════════════ -->
    {#if !data.groupId}
        <div
            class="flex min-h-[calc(100vh-64px)] items-center justify-center px-6"
        >
            <div
                class="flex w-full max-w-xl flex-col items-center gap-6 text-center"
            >
                <div
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100"
                >
                    <AlertCircleIcon class="h-10 w-10 text-orange-600" />
                </div>

                <div class="flex flex-col gap-2">
                    <h2 class="text-2xl font-bold text-gray-900">
                        You are not in a group yet
                    </h2>
                    <p class="text-base text-gray-500 leading-relaxed">
                        You need to join or create a group before you can
                        register a topic. Please contact your lecturer or join
                        an existing group to proceed.
                    </p>
                </div>

                <div
                    class="w-full rounded-2xl border border-orange-200 bg-orange-50 p-6 text-left"
                >
                    <div class="flex items-center gap-2 mb-3">
                        <InfoIcon class="h-5 w-5 text-orange-600" />
                        <p
                            class="font-bold uppercase tracking-widest text-orange-700 text-xs"
                        >
                            Note
                        </p>
                    </div>
                    <ul class="flex flex-col gap-2.5 text-sm text-orange-800">
                        {#each ["Topic registration requires an active group membership.", "Each group can only register one topic at a time.", "Contact your lecturer if you have not been assigned to a group."] as note}
                            <li class="flex items-start gap-3">
                                <span
                                    class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400"
                                ></span>
                                <span class="leading-relaxed">{note}</span>
                            </li>
                        {/each}
                    </ul>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    class="mt-4 h-11 border-gray-200 px-6 text-gray-700 hover:bg-gray-50 text-base cursor-pointer"
                    onclick={() => goto(`/app`)}
                >
                    <ArrowLeftIcon class="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════════════
        TOPIC EXISTS
    ═══════════════════════════════════════════════════════════════════════════ -->
    {:else if data.currentTopic && data.currentTopic.length > 0}
        {@const topic = data.currentTopic[0]}

        {#if isResubmitting}
            <!-- ── RESUBMIT FORM ──────────────────────────────────────────────── -->
            <!-- Top bar -->
            <div
                class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
            >
                <Button
                    variant="ghost"
                    onclick={() => (isResubmitting = false)}
                    class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                    <ArrowLeftIcon class="h-4 w-4" />
                    <span class="text-sm font-semibold">Cancel</span>
                </Button>

                <Button
                    form="resubmit-topic-form"
                    type="submit"
                    disabled={isUploading}
                    class="bg-orange-600 px-6 text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                    Resubmit Topic
                </Button>
            </div>

            <!-- Content -->
            <div class="px-6 py-8 space-y-6 max-w-[1600px] mx-auto">
                <div>
                    <h1
                        class="text-3xl font-extrabold tracking-tight text-gray-900"
                    >
                        Resubmit Topic
                    </h1>
                    <p class="mt-1 text-base text-gray-500">
                        Update and resubmit your rejected topic for review.
                    </p>
                </div>

                {#if topic.reviewComment}
                    <div
                        class="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm"
                    >
                        <div
                            class="mt-0.5 rounded-full bg-red-100 p-2 shrink-0"
                        >
                            <AlertCircleIcon class="h-5 w-5 text-red-600" />
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-red-800 mb-1">
                                Rejection Reason
                            </p>
                            <p class="text-base text-red-700 leading-relaxed">
                                {topic.reviewComment}
                            </p>
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
                        "/app/student/register-topic",
                        () => (isResubmitting = false),
                    )}
                >
                    <input type="hidden" name="groupId" value={data.groupId} />
                    <input type="hidden" name="logoUrl" value={logoUrl} />

                    <div
                        class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
                    >
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
                            <LogoUploader bind:logoUrl bind:previewUrl />
                        </div>
                    </div>
                </form>
            </div>
        {:else}
            <!-- ── VIEW TOPIC ─────────────────────────────────────────────────── -->
            <!-- Top bar -->
            <div
                class="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 backdrop-blur-sm"
            >
                <Button
                    variant="ghost"
                    onclick={() => goto("/app")}
                    class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                    <ArrowLeftIcon class="h-4 w-4" />
                    <span class="text-sm font-semibold">Back to Home</span>
                </Button>

                {#if topic.status === "Rejected"}
                    <Button
                        type="button"
                        class="bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-sm"
                        onclick={enterResubmit}
                    >
                        Resubmit Topic
                    </Button>
                {:else if topic.status !== "Approved"}
                    <Button
                        type="button"
                        class="bg-orange-600 text-white hover:bg-orange-700 cursor-pointer shadow-sm"
                        onclick={() => goto("./register-topic/update")}
                    >
                        Update Topic
                    </Button>
                {/if}
            </div>

            <!-- Content -->
            <div class="px-6 py-5 space-y-6 max-w-400 mx-auto">
                <!-- Info banner -->
                <div
                    class="flex items-start gap-4 rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm"
                >
                    <div class="mt-0.5 rounded-full bg-orange-100 p-2 shrink-0">
                        <InfoIcon class="h-5 w-5 text-orange-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-base font-bold text-orange-800 mb-1">
                            Topic already registered
                        </p>
                        <p class="text-sm text-orange-700 leading-relaxed">
                            Your group has submitted a topic. You can view the
                            details below.
                            {#if topic.status !== "Approved"}
                                Update it if needed.
                            {/if}
                        </p>
                    </div>
                </div>

                <!-- Row 1: Topic Information + Project Logo -->
                <div class="grid grid-cols-1 gap-6 2xl:grid-cols-12">
                    <!-- Topic Detail -->
                    <div
                        class="2xl:col-span-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                        <div
                            class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                        >
                            <p
                                class="text-xs font-bold uppercase tracking-widest text-gray-400"
                            >
                                Topic Information
                            </p>
                        </div>
                        <div class="p-0">
                            {#each [{ label: "Title", value: topic.title }, { label: "Description", value: topic.description }, { label: "Objectives", value: topic.objectives }, { label: "Submitted At", value: formatIfDate(topic.submittedAt) }] as field, i}
                                <div
                                    class="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-[180px_1fr]"
                                >
                                    <span
                                        class="text-sm font-medium text-gray-500"
                                        >{field.label}</span
                                    >
                                    {#if field.value}
                                        <span
                                            class="text-base font-medium leading-relaxed text-gray-900"
                                            >{field.value}</span
                                        >
                                    {:else}
                                        <span
                                            class="text-base italic text-gray-400"
                                            >Not specified</span
                                        >
                                    {/if}
                                </div>
                                {#if i < 3}
                                    <Separator class="bg-gray-100" />
                                {/if}
                            {/each}

                            <Separator class="bg-gray-100" />
                            <div
                                class="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-[180px_1fr]"
                            >
                                <span class="text-sm font-medium text-gray-500"
                                    >Status</span
                                >
                                <div>
                                    <span
                                        class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide
                            ${
                                topic.status === "Pending"
                                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                                    : topic.status === "Approved"
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : topic.status === "Rejected"
                                        ? "bg-red-100 text-red-700 border border-red-200"
                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                                    >
                                        {topic.status}
                                    </span>
                                </div>
                            </div>

                            {#if topic.status === "Rejected" && topic.reviewComment}
                                <Separator class="bg-gray-100" />
                                <div
                                    class="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-[180px_1fr] bg-red-50/50"
                                >
                                    <span class="text-sm font-bold text-red-600"
                                        >Rejection Reason</span
                                    >
                                    <span
                                        class="text-base font-medium leading-relaxed text-red-700"
                                        >{topic.reviewComment}</span
                                    >
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Project Logo -->
                    {#if topic.logoUrl}
                        <div
                            class="2xl:col-span-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                            <div
                                class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                            >
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-gray-400"
                                >
                                    Project Logo
                                </p>
                            </div>
                            <div
                                class="flex flex-col items-center gap-4 px-6 py-8"
                            >
                                <img
                                    src={topic.logoUrl}
                                    alt="Project logo"
                                    class="h-40 w-40 rounded-2xl border border-gray-200 object-cover shadow-sm"
                                />
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Row 2: Submitted By + Group -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {#each [{ heading: "Submitted By", rows: [{ label: "Full Name", value: topic.submittedBy?.fullName }, { label: "Student Code", value: topic.submittedBy?.studentCode }, { label: "Email", value: topic.submittedBy?.email }] }, { heading: "Group", rows: [{ label: "Group Name", value: topic.group?.groupName }, { label: "Class Code", value: topic.group?.classCode }, { label: "Members", value: topic.group?.memberCount != null ? `${topic.group.memberCount} members` : undefined }] }] as section}
                        <div
                            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                        >
                            <div
                                class="border-b border-gray-100 bg-gray-50/60 px-6 py-4"
                            >
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-gray-400"
                                >
                                    {section.heading}
                                </p>
                            </div>
                            <div class="flex flex-col divide-y divide-gray-100">
                                {#each section.rows as row}
                                    <div class="px-6 py-4">
                                        <p class="mb-1 text-sm text-gray-500">
                                            {row.label}
                                        </p>
                                        <p
                                            class="text-base font-medium text-gray-900 break-all"
                                        >
                                            {row.value ?? "—"}
                                        </p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- ══════════════════════════════════════════════════════════════════════════
        REGISTER FORM
    ═══════════════════════════════════════════════════════════════════════════ -->
    {:else}
        <!-- Top bar -->
        <div
            class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm"
        >
            <Button
                variant="ghost"
                onclick={() => goto("/app")}
                class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
                <ArrowLeftIcon class="h-4 w-4" />
                <span class="text-sm font-semibold">Back to Home</span>
            </Button>

            <Button
                form="register-topic-form"
                type="submit"
                disabled={isUploading}
                class="bg-orange-600 px-6 text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer shadow-sm"
            >
                Register Topic
            </Button>
        </div>

        <!-- Content -->
        <div class="px-6 py-8 space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1
                    class="text-3xl font-extrabold tracking-tight text-gray-900"
                >
                    Register Topic
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    Fill in the details for your graduation project topic.
                </p>
            </div>

            <form
                id="register-topic-form"
                method="POST"
                action="?/RegisterTopic"
                use:enhance={makeEnhancer(
                    "Registering topic...",
                    "Topic registered successfully!",
                    "/app/student/register-topic",
                )}
            >
                <input type="hidden" name="groupId" value={data.groupId} />
                <input type="hidden" name="logoUrl" value={logoUrl} />

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    <!-- Form Fields -->
                    <div class="xl:col-span-8 flex flex-col gap-6">
                        <TopicFormFields
                            errorMessage={form?.message as string}
                        />
                    </div>

                    <!-- Logo Uploader -->
                    <div class="xl:col-span-4 sticky top-24">
                        <LogoUploader bind:logoUrl bind:previewUrl />
                    </div>
                </div>
            </form>
        </div>
    {/if}
</div>
