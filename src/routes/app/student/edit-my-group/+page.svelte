<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import { toast } from "svelte-sonner";
    import type { PageData } from "../$types";
    import { ArrowLeftIcon } from "lucide-svelte";

    const statusClass: Record<string, string> = {
        Draft: "bg-gray-200 text-gray-600",
        Pending: "bg-gray-200 text-gray-600",
        Approved: "bg-green-200 text-green-600",
        Active: "bg-green-200 text-green-600",
        Rejected: "bg-red-200 text-red-600",
        Completed: "bg-blue-200 text-blue-600",
    };

    let { data } = $props<{ data: PageData }>();
    const group = data?.group;

    let form = {
        groupName: group?.groupName ?? "",
        groupDescription: group?.groupDescription ?? "",
    };
    let isLoading = $state(false);
</script>

<a
    class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
    href="/app"><ArrowLeftIcon />Back to Dashboard</a
>
<div class="max-w-2xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-stone-800">Edit Group</h1>
        <Badge
            class="{statusClass[group?.status] ??
                'bg-stone-200 text-stone-600'} text-[14px] leading-none py-1 px-2.5"
        >
            {group?.status}
        </Badge>
    </div>

    <!-- Info Cards -->
    <div class="grid grid-cols-2 gap-4">
        <div
            class="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1"
        >
            <p
                class="text-xs font-medium text-stone-400 uppercase tracking-wide"
            >
                Topic
            </p>
            <p class="text-sm font-semibold text-stone-700">
                {group?.topic?.title}
            </p>
        </div>
        <div
            class="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1"
        >
            <p
                class="text-xs font-medium text-stone-400 uppercase tracking-wide"
            >
                Members
            </p>
            <p class="text-sm font-semibold text-stone-700">
                {group?.members?.length} member{group?.members?.length > 1
                    ? "s"
                    : ""}
            </p>
        </div>
    </div>

    <!-- Edit Form -->
    <form
        method="POST"
        action="?/EditMyGroup"
        class="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
        use:enhance={() => {
            isLoading = true;

            return async ({ result }) => {
                isLoading = false;
                if (result.type === "success") {
                    toast.success("Group updated successfully!");
                } else if (result.type === "failure") {
                    toast.error(
                        (result.data as { message?: string })?.message ??
                            "Something went wrong.",
                    );
                }
            };
        }}
    >
        <h2 class="text-base font-semibold text-stone-700">
            Group Information
        </h2>

        <!-- Hidden groupId -->
        <input type="hidden" name="groupId" value={group?.groupId} />

        <!-- Group Name -->
        <div class="space-y-1.5">
            <label class="text-sm font-medium text-stone-600" for="groupName">
                Group Name <span class="text-red-500">*</span>
            </label>
            <input
                id="groupName"
                name="groupName"
                type="text"
                bind:value={form.groupName}
                placeholder="Enter group name..."
                class="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
        </div>

        <!-- Group Description -->
        <div class="space-y-1.5">
            <label
                class="text-sm font-medium text-stone-600"
                for="groupDescription"
            >
                Description
            </label>
            <textarea
                id="groupDescription"
                name="groupDescription"
                bind:value={form.groupDescription}
                placeholder="Enter group description..."
                rows={4}
                class="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
            <button
                type="button"
                class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                onclick={() => goto("/app")}
            >
                Cancel
            </button>
            <button
                type="submit"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition cursor-pointer"
            >
                {isLoading ? "Saving..." : "Save Changes"}
            </button>
        </div>
    </form>
</div>
