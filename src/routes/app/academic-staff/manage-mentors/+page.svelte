<script lang="ts">
    import DataTable from "$lib/components/ui/data-table/data-table.svelte";
    import {
        ArrowLeftIcon,
        UsersIcon,
        SettingsIcon,
        Loader2Icon,
    } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import type { SubmitFunction } from "@sveltejs/kit";

    const { data } = $props();
    let mentors = $derived(data?.mentors || []);
    let totalCount = $derived(data?.totalCount || 0);
    let maxGroupsConfig = $derived(data?.maxGroupsConfig);
    const cacheKeyName = "staff-mentor-management";

    let configOpen = $state(false);
    let isConfigLoading = $state(false);

    let filters = $derived([]);
    let defaultHeaders = $state([
        "mentorCode",
        "fullName",
        "email",
        "phoneNumber",
        "fieldOfWork",
    ]);
    let headerValues = $state({
        mentorCode: "Mentor Code",
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number",
        fieldOfWork: "Field Of Work",
    });

    const handleConfigSubmit: SubmitFunction = () => {
        isConfigLoading = true;
        return async ({ result, update }) => {
            isConfigLoading = false;
            if (result.type === "success") {
                toast.success("Max groups per mentor updated!");
                configOpen = false;
                await update();
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as { message?: string })?.message ??
                        "Failed to update config.",
                );
            }
        };
    };
</script>

<div
    class="bg-white w-full min-h-screen px-10 rounded-md pt-5 h-fit overflow-x-hidden pb-10 z-10 select-none"
>
    <div class="flex items-center h-12">
        <Button
            variant="ghost"
            onclick={() => goto(`/app/academic-staff`)}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </Button>
    </div>

    <!-- Page Title -->
    <div class="flex items-center justify-between mb-6 mt-2 px-1">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0"
            >
                <UsersIcon class="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-amber-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Management
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    Mentor List
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <!-- Config Button -->
            <button
                type="button"
                onclick={() => (configOpen = true)}
                class="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition text-sm font-semibold cursor-pointer"
            >
                <SettingsIcon class="w-4 h-4" />
                Max Groups Per Mentor
                <span
                    class="ml-1 bg-amber-200 text-amber-800 rounded-full px-2 py-0.5 text-xs font-bold"
                >
                    {maxGroupsConfig?.maxGroupsPerMentor ?? "—"}
                </span>
            </button>

            <!-- Total Badge -->
            <div
                class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-100"
            >
                <span class="text-sm text-stone-400 font-medium">Total</span>
                <span class="text-sm font-extrabold text-stone-800"
                    >{totalCount}</span
                >
                <span class="text-sm text-stone-400">mentors</span>
            </div>
        </div>
    </div>

    <DataTable
        showAction={true}
        showAddButton={false}
        actions={["view"]}
        statuses={[]}
        keyId={"mentorId"}
        {cacheKeyName}
        {headerValues}
        allowSortHeaders={[]}
        tableName={"Mentor"}
        {defaultHeaders}
        items={mentors}
        totalItems={totalCount}
        activePaginate
        matchSearchColumns={["mentorName", "mentorCode"]}
        {filters}
    />
</div>

<!-- Config Dialog -->
<Dialog.Root bind:open={configOpen}>
    <Dialog.Content class="max-w-sm p-0 gap-0 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center gap-2 px-6 py-4 border-b border-zinc-100">
            <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50"
            >
                <SettingsIcon class="h-4 w-4 text-amber-500" />
            </div>
            <div>
                <h2 class="text-sm font-bold text-zinc-900">
                    Max Groups Per Mentor
                </h2>
                <p class="text-xs text-zinc-400">
                    Set the group limit for all mentors
                </p>
            </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
            <!-- Current value -->
            <div
                class="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 mb-5"
            >
                <span class="text-3xl font-extrabold text-amber-600">
                    {maxGroupsConfig?.maxGroupsPerMentor ?? "—"}
                </span>
                <span class="text-xs text-zinc-500 leading-snug">
                    current limit<br />per mentor
                </span>
            </div>

            <!-- Form -->
            <form
                method="POST"
                action="?/configMaxGroupsPerMentor"
                use:enhance={handleConfigSubmit}
                class="space-y-4"
            >
                <div class="space-y-1.5">
                    <label
                        class="text-xs font-semibold text-zinc-600"
                        for="maxGroupsInput"
                    >
                        New limit
                    </label>
                    <input
                        id="maxGroupsInput"
                        type="number"
                        name="maxGroupsPerMentor"
                        min="1"
                        max="20"
                        value={maxGroupsConfig?.maxGroupsPerMentor ?? 5}
                        class="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-zinc-50"
                    />
                </div>

                <div class="flex gap-2 pt-1">
                    <button
                        type="button"
                        onclick={() => (configOpen = false)}
                        class="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isConfigLoading}
                        class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {#if isConfigLoading}
                            <Loader2Icon class="h-4 w-4 animate-spin" />
                            Saving...
                        {:else}
                            <SettingsIcon class="h-4 w-4" />
                            Save
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </Dialog.Content>
</Dialog.Root>
