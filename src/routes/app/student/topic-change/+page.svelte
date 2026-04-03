<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import {
        ArrowLeftIcon,
        AlertCircleIcon,
        InfoIcon,
        RefreshCwIcon,
        PencilIcon,
        XIcon,
    } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    import LogoUploader from "../register-topic/components/LogoUploader.svelte";
    import TopicFormFields from "../register-topic/components/TopicFormFields.svelte";
    import { formatIfDate } from "$lib/utils/date-format";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    const topic = $derived(data.currentTopic?.[0]);
    const isPending = $derived(topic?.status === "Pending");

    // ── shared upload state ──────────────────────────────────────────────────
    let logoUrl = $state(topic?.logoUrl ?? "");
    let previewUrl = $state(topic?.logoUrl ?? "");
    let isUploading = $state(false);

    // ── update / change mode toggles ──────────────────────────────────────────
    let isUpdating = $state(false);
    let isChanging = $state(false);

    function enterUpdate() {
        logoUrl = topic?.logoUrl ?? "";
        previewUrl = topic?.logoUrl ?? "";
        isUpdating = true;
    }

    function enterChange() {
        logoUrl = topic?.logoUrl ?? "";
        previewUrl = topic?.logoUrl ?? "";
        isChanging = true;
    }

    function cancelAction() {
        isUpdating = false;
        isChanging = false;
    }

    // ── generic form enhancer ────────────────────────────────────────────────
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
    <!-- ══════════════════════════════════════════════════
         GUARD: No group
    ═══════════════════════════════════════════════════ -->
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
                        You need to join or create a group before you can change
                        a topic.
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
                        {#each ["Topic change requires an active group membership.", "Each group can only have one active topic at a time.", "Contact your lecturer if you have not been assigned to a group."] as note}
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
                    onclick={() => history.back()}
                >
                    <ArrowLeftIcon class="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        </div>

        <!-- ══════════════════════════════════════════════════
         MAIN CONTENT
    ═══════════════════════════════════════════════════ -->
    {:else}
        <!-- ── Top bar ──────────────────────────────────────────────────────── -->
        <div
            class="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-3 backdrop-blur-sm"
        >
            {#if isUpdating || isChanging}
                <Button
                    variant="ghost"
                    onclick={cancelAction}
                    class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                    <XIcon class="h-4 w-4" />
                    <span class="text-sm font-semibold">Cancel</span>
                </Button>

                {#if isUpdating}
                    <Button
                        form="update-topic-form"
                        type="submit"
                        disabled={isUploading}
                        class="bg-orange-600 px-6 text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        <PencilIcon class="mr-2 h-4 w-4" />
                        Save Update
                    </Button>
                {:else if isChanging}
                    <Button
                        form="change-topic-form"
                        type="submit"
                        disabled={isUploading}
                        class="bg-orange-600 px-6 text-white hover:bg-orange-700 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                        <RefreshCwIcon class="mr-2 h-4 w-4" />
                        Submit Change Request
                    </Button>
                {/if}
            {:else}
                <Button
                    variant="ghost"
                    onclick={() => goto("/app")}
                    class="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                >
                    <ArrowLeftIcon class="h-4 w-4" />
                    <span class="text-sm font-semibold">Back to Home</span>
                </Button>

                <!-- Action buttons based on topic status -->
                {#if isPending}
                    <Button
                        type="button"
                        onclick={enterUpdate}
                        class="bg-orange-600 px-6 text-white hover:bg-orange-700 cursor-pointer shadow-sm"
                    >
                        <PencilIcon class="mr-2 h-4 w-4" />
                        Update Topic
                    </Button>
                {:else if topic.status === "Rejected"}
                    <Button
                        type="button"
                        onclick={enterChange}
                        class="bg-orange-600 px-6 text-white hover:bg-orange-700 cursor-pointer shadow-sm"
                    >
                        <RefreshCwIcon class="mr-2 h-4 w-4" />
                        Create New Topic Change Request
                    </Button>
                {/if}
                <!-- NOTE: Khi Approved sẽ không xuất hiện button nào ở đây -->
            {/if}
        </div>

        <!-- ── Content ──────────────────────────────────────────────────────── -->
        <div class="px-6 py-8 space-y-6 max-w-[1600px] mx-auto">
            <!-- Page header -->
            <div>
                <h1
                    class="text-3xl font-extrabold tracking-tight text-gray-900"
                >
                    {isUpdating
                        ? "Update Topic"
                        : isChanging
                          ? "New Topic Change Request"
                          : "Change Topic"}
                </h1>
                <p class="mt-1 text-base text-gray-500">
                    {#if isUpdating}
                        Edit and save changes to your pending topic before it is
                        reviewed.
                    {:else if isChanging}
                        Submit a request to change your group's registered
                        graduation project topic.
                    {:else}
                        View your current topic and change request status.
                    {/if}
                </p>
            </div>

            <!-- ══════════════════════════════════════════════════
                 UPDATE FORM
            ═══════════════════════════════════════════════════ -->
            {#if isUpdating && topic}
                <form
                    id="update-topic-form"
                    method="POST"
                    action="?/UpdateTopic"
                    use:enhance={makeEnhancer(
                        "Updating topic...",
                        "Topic updated successfully!",
                        "/app/student/topic-change",
                        () => (isUpdating = false),
                    )}
                >
                    <input type="hidden" name="topicId" value={topic.topicId} />
                    <input type="hidden" name="logoUrl" value={logoUrl} />

                    <div
                        class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
                    >
                        <div class="xl:col-span-8 flex flex-col gap-6">
                            <TopicFormFields
                                title={topic.title}
                                description={topic.description}
                                objectives={topic.objectives ?? ""}
                                errorMessage={form?.message as string}
                            />
                        </div>
                        <div class="xl:col-span-4 sticky top-24">
                            <LogoUploader bind:logoUrl bind:previewUrl />
                        </div>
                    </div>
                </form>

                <!-- ══════════════════════════════════════════════════
                 CHANGE FORM (Hiển thị khi Create New Change Request)
            ═══════════════════════════════════════════════════ -->
            {:else if isChanging}
                {#if topic?.status === "Rejected" && topic?.reviewComment}
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
                                Previous Rejection Reason
                            </p>
                            <p class="text-base text-red-700 leading-relaxed">
                                {topic.reviewComment}
                            </p>
                        </div>
                    </div>
                {/if}

                <form
                    id="change-topic-form"
                    method="POST"
                    action="?/ChangeTopic"
                    use:enhance={makeEnhancer(
                        "Submitting change request...",
                        "Change request submitted successfully!",
                        "/app/student/topic-change",
                        () => (isChanging = false),
                    )}
                >
                    <input type="hidden" name="groupId" value={data.groupId} />
                    <input type="hidden" name="logoUrl" value={logoUrl} />

                    <div
                        class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
                    >
                        <div class="xl:col-span-8 flex flex-col gap-6">
                            <TopicFormFields
                                title={topic?.title ?? ""}
                                description={topic?.description ?? ""}
                                objectives={topic?.objectives ?? ""}
                                errorMessage={form?.message as string}
                            />
                        </div>
                        <div class="xl:col-span-4 sticky top-24">
                            <LogoUploader bind:logoUrl bind:previewUrl />
                        </div>
                    </div>
                </form>

                <!-- ══════════════════════════════════════════════════
                 DEFAULT VIEW (Read-only Info)
            ═══════════════════════════════════════════════════ -->
            {:else}
                <!-- Info banner -->
                <div
                    class="flex items-start gap-4 rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm"
                >
                    <div class="mt-0.5 rounded-full bg-orange-100 p-2 shrink-0">
                        <InfoIcon class="h-5 w-5 text-orange-600" />
                    </div>
                    <div class="flex-1">
                        <p class="text-base font-bold text-orange-800 mb-1">
                            {#if isPending}
                                Topic is Pending Review
                            {:else if topic?.status === "Rejected"}
                                Topic Change Request Rejected
                            {:else if topic?.status === "Approved"}
                                Topic is Approved
                            {:else}
                                Topic Status
                            {/if}
                        </p>
                        <p class="text-sm text-orange-700 leading-relaxed">
                            {#if isPending}
                                Your topic is currently awaiting review. You can
                                still update the details before your lecturer
                                approves it.
                            {:else if topic?.status === "Rejected"}
                                Your previous change request was rejected. You
                                can create a new request if needed.
                            {:else if topic?.status === "Approved"}
                                Your topic is active and approved. No further
                                actions are required.
                            {:else}
                                Here are the details of your current topic.
                            {/if}
                        </p>
                    </div>
                </div>

                <!-- Current topic preview -->
                {#if topic}
                    <div class="grid grid-cols-1 gap-6 2xl:grid-cols-12">
                        <!-- Left: Topic Detail -->
                        <div class="2xl:col-span-8 flex flex-col gap-6">
                            <div
                                class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                            >
                                <div
                                    class="border-b border-gray-100 bg-gray-50/60 px-6 py-4 flex items-center justify-between"
                                >
                                    <p
                                        class="text-xs font-bold uppercase tracking-widest text-gray-400"
                                    >
                                        Current Topic
                                    </p>
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
                                <div class="p-0">
                                    {#each [{ label: "Title", value: topic.title }, { label: "Description", value: topic.description }, { label: "Objectives", value: topic.objectives }, { label: "Submitted At", value: formatIfDate(topic.submittedAt) }] as field, i}
                                        <div
                                            class="grid grid-cols-1 gap-2 px-6 py-4 sm:grid-cols-[180px_1fr]"
                                        >
                                            <span
                                                class="text-sm font-medium text-gray-500"
                                            >
                                                {field.label}
                                            </span>
                                            {#if field.value}
                                                <span
                                                    class="text-sm font-medium leading-relaxed text-gray-900"
                                                >
                                                    {field.value}
                                                </span>
                                            {:else}
                                                <span
                                                    class="text-sm italic text-gray-400"
                                                >
                                                    Not specified
                                                </span>
                                            {/if}
                                        </div>
                                        {#if i < 3}
                                            <Separator class="bg-gray-100" />
                                        {/if}
                                    {/each}
                                </div>
                                {#if topic.status === "Rejected" && topic.reviewComment}
                                    <Separator class="bg-gray-100" />
                                    <div
                                        class="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-[180px_1fr] bg-red-50/50"
                                    >
                                        <span
                                            class="text-sm font-bold text-red-600"
                                            >Rejection Reason</span
                                        >
                                        <span
                                            class="text-sm font-medium leading-relaxed text-red-700"
                                        >
                                            {topic.reviewComment}
                                        </span>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Right Sidebar: Logo, Submitted By, Group -->
                        <div class="2xl:col-span-4 flex flex-col gap-6">
                            {#if topic.logoUrl}
                                <div
                                    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
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
                                            class="h-32 w-32 rounded-2xl border border-gray-200 object-cover shadow-sm"
                                        />
                                    </div>
                                </div>
                            {/if}

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
                                    <div
                                        class="flex flex-col divide-y divide-gray-100"
                                    >
                                        {#each section.rows as row}
                                            <div class="px-6 py-4">
                                                <p
                                                    class="mb-1 text-sm text-gray-500"
                                                >
                                                    {row.label}
                                                </p>
                                                <p
                                                    class="text-sm font-medium text-gray-900 break-all"
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
            {/if}
        </div>
    {/if}
</div>
