<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import * as Card from "$lib/components/ui/card";
    import { ArrowLeftIcon } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import type { PageData, ActionData } from "./$types";

    // ── Shared child components ──────────────────────────────────────────────
    import LogoUploader from "./components/LogoUploader.svelte";
    import TopicFormFields from "./components/TopicFormFields.svelte";
    import PageHeader from "./components/PageHeader.svelte";

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

<!-- ══════════════════════════════════════════════════════════════════════════
     GUARD: No group
═══════════════════════════════════════════════════════════════════════════ -->
{#if !data.groupId}
    <div
        class="flex min-h-[calc(100vh-80px)] items-center justify-center px-8 pt-20"
    >
        <div class="flex max-w-md flex-col items-center gap-4 text-center">
            <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                </svg>
            </div>

            <div class="flex flex-col gap-1">
                <h2 class="text-lg font-semibold text-zinc-900">
                    You are not in a group yet
                </h2>
                <p class="text-sm text-zinc-500 leading-relaxed">
                    You need to join or create a group before you can register a
                    topic. Please contact your lecturer or join an existing
                    group to proceed.
                </p>
            </div>

            <div
                class="mt-2 w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left"
            >
                <p
                    class="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500"
                >
                    Note
                </p>
                <ul class="flex flex-col gap-1 text-sm text-orange-700">
                    {#each ["Topic registration requires an active group membership.", "Each group can only register one topic at a time.", "Contact your lecturer if you have not been assigned to a group."] as note}
                        <li class="flex items-start gap-2">
                            <span class="mt-0.5 text-orange-400">•</span>
                            {note}
                        </li>
                    {/each}
                </ul>
            </div>

            <Button
                type="button"
                variant="outline"
                class="mt-2 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                onclick={() => history.back()}
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
        <PageHeader
            title="Resubmit Topic"
            subtitle="Update and resubmit your rejected topic for review"
            onBack={() => (isResubmitting = false)}
        >
            {#snippet actions()}
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    onclick={() => (isResubmitting = false)}
                >
                    Cancel
                </Button>
                <Button
                    form="resubmit-topic-form"
                    type="submit"
                    disabled={isUploading}
                    class="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    Resubmit Topic
                </Button>
            {/snippet}
        </PageHeader>

        <div class="mx-auto max-w-5xl px-8 py-8">
            {#if topic.reviewComment}
                <div
                    class="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                    </svg>
                    <div>
                        <p class="text-sm font-medium text-red-700">
                            Rejection Reason
                        </p>
                        <p class="mt-0.5 text-xs text-red-600">
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

                <div class="grid grid-cols-3 gap-8">
                    <div class="col-span-2 flex flex-col gap-6">
                        <TopicFormFields
                            title={topic.title}
                            description={topic.description}
                            objectives={topic.objectives ?? ""}
                            errorMessage={form?.message as string}
                        />
                    </div>
                    <div class="col-span-1 flex flex-col gap-6">
                        <LogoUploader bind:logoUrl bind:previewUrl />
                    </div>
                </div>
            </form>
        </div>
    {:else}
        <!-- ── VIEW TOPIC ─────────────────────────────────────────────────── -->
        <PageHeader
            title="Registered Topic"
            subtitle="Your group has already registered a topic"
            onBack={() => goto("/app")}
        >
            {#snippet actions()}
                {#if topic.status === "Rejected"}
                    <Button
                        type="button"
                        class="bg-orange-500 text-white hover:bg-orange-600"
                        onclick={enterResubmit}
                    >
                        Resubmit Topic
                    </Button>
                {:else if topic.status !== "Approved"}
                    <Button
                        type="button"
                        class="bg-orange-500 text-white hover:bg-orange-600"
                        onclick={() => goto("./register-topic/update")}
                    >
                        Update Topic
                    </Button>
                {/if}
            {/snippet}
        </PageHeader>

        <div class="mx-auto max-w-5xl px-8 py-8">
            <div
                class="mb-6 flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                </svg>
                <div>
                    <p class="text-sm font-medium text-orange-700">
                        Topic already registered
                    </p>
                    <p class="mt-0.5 text-xs text-orange-600">
                        Your group has submitted a topic. You can update it
                        below if needed.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-8">
                <!-- Topic detail (2/3) -->
                <div class="col-span-2">
                    <Card.Root
                        class="rounded-xl border border-zinc-200 shadow-sm"
                    >
                        <Card.Header>
                            <p
                                class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
                            >
                                Topic Information
                            </p>
                        </Card.Header>
                        <Separator />
                        <Card.Content class="p-0">
                            {@const fields = [
                                { label: "Title", value: topic.title },
                                {
                                    label: "Description",
                                    value: topic.description,
                                },
                                {
                                    label: "Objectives",
                                    value: topic.objectives,
                                },
                                {
                                    label: "Submitted At",
                                    value: new Intl.DateTimeFormat("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                    }).format(new Date(topic.submittedAt)),
                                },
                            ]}
                            {#each fields as field, i}
                                <div class="flex items-start gap-4 px-6 py-4">
                                    <span
                                        class="w-36 shrink-0 text-sm text-zinc-500"
                                        >{field.label}</span
                                    >
                                    {#if field.value}
                                        <span
                                            class="text-sm font-medium text-zinc-900"
                                            >{field.value}</span
                                        >
                                    {:else}
                                        <span
                                            class="text-sm italic text-zinc-400"
                                            >Not specified</span
                                        >
                                    {/if}
                                </div>
                                {#if i < fields.length - 1}<Separator />{/if}
                            {/each}

                            <Separator />
                            <div class="flex items-center gap-4 px-6 py-4">
                                <span
                                    class="w-36 shrink-0 text-sm text-zinc-500"
                                    >Status</span
                                >
                                <span
                                    class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                    ${
                                        topic.status === "Pending"
                                            ? "bg-orange-500 text-white"
                                            : topic.status === "Approved"
                                              ? "bg-green-600 text-white"
                                              : topic.status === "Rejected"
                                                ? "bg-red-500 text-white"
                                                : "bg-zinc-200 text-zinc-800"
                                    }`}
                                >
                                    {topic.status}
                                </span>
                            </div>

                            {#if topic.status === "Rejected" && topic.reviewComment}
                                <Separator />
                                <div class="flex items-start gap-4 px-6 py-4">
                                    <span
                                        class="w-36 shrink-0 text-sm text-zinc-500"
                                        >Rejection Reason</span
                                    >
                                    <span
                                        class="text-sm font-medium text-red-600"
                                        >{topic.reviewComment}</span
                                    >
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Sidebar (1/3) -->
                <div class="col-span-1 flex flex-col gap-6">
                    {#if topic.logoUrl}
                        <Card.Root
                            class="rounded-xl border border-zinc-200 shadow-sm"
                        >
                            <Card.Header>
                                <p
                                    class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
                                >
                                    Project Logo
                                </p>
                            </Card.Header>
                            <Separator />
                            <Card.Content
                                class="flex flex-col items-center gap-3 py-5"
                            >
                                <img
                                    src={topic.logoUrl}
                                    alt="Project logo"
                                    class="h-24 w-24 rounded-lg object-cover border border-zinc-200"
                                />
                                <p
                                    class="break-all px-2 text-center text-xs text-zinc-400"
                                >
                                    {topic.logoUrl}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    {/if}

                    <!-- Submitted By / Group — shared row renderer -->
                    {#each [{ heading: "Submitted By", rows: [{ label: "Full Name", value: topic.submittedBy?.fullName }, { label: "Student Code", value: topic.submittedBy?.studentCode }, { label: "Email", value: topic.submittedBy?.email }] }, { heading: "Group", rows: [{ label: "Group Name", value: topic.group?.groupName }, { label: "Class Code", value: topic.group?.classCode }, { label: "Members", value: topic.group?.memberCount != null ? `${topic.group.memberCount} members` : undefined }] }] as section}
                        <Card.Root
                            class="rounded-xl border border-zinc-200 shadow-sm"
                        >
                            <Card.Header>
                                <p
                                    class="text-xs font-semibold uppercase tracking-widest text-zinc-400"
                                >
                                    {section.heading}
                                </p>
                            </Card.Header>
                            <Separator />
                            <Card.Content class="p-0">
                                <div
                                    class="flex flex-col divide-y divide-zinc-100"
                                >
                                    {#each section.rows as row}
                                        <div class="px-5 py-3">
                                            <p class="text-xs text-zinc-400">
                                                {row.label}
                                            </p>
                                            <p
                                                class="break-all text-sm font-medium text-zinc-900"
                                            >
                                                {row.value ?? "—"}
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            </div>
        </div>
    {/if}

    <!-- ══════════════════════════════════════════════════════════════════════════
     REGISTER FORM
═══════════════════════════════════════════════════════════════════════════ -->
{:else}
    <PageHeader
        title="Register Topic"
        subtitle="Fill in the details for your graduation project"
        onBack={() => goto("/app")}
    >
        {#snippet actions()}
            <Button
                type="button"
                variant="outline"
                class="cursor-pointer border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                onclick={() => goto("/app")}
            >
                Cancel
            </Button>
            <Button
                form="register-topic-form"
                type="submit"
                disabled={isUploading}
                class="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
                Register Topic
            </Button>
        {/snippet}
    </PageHeader>

    <div class="mx-auto max-w-5xl px-8 py-8">
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

            <div class="grid grid-cols-3 gap-8">
                <div class="col-span-2 flex flex-col gap-6">
                    <TopicFormFields errorMessage={form?.message as string} />
                </div>
                <div class="col-span-1 flex flex-col gap-6">
                    <LogoUploader bind:logoUrl bind:previewUrl />
                </div>
            </div>
        </form>
    </div>
{/if}
