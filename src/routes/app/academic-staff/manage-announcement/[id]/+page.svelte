<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import { BellIcon, PencilIcon, ArrowLeftIcon } from "lucide-svelte";

    let { data } = $props();
    const announcement = data.announcement;

    const targets = Array.isArray(announcement.targets)
        ? announcement.targets
        : announcement.targets
          ? [announcement.targets]
          : [];
</script>

<div class="flex min-h-screen w-screen flex-col items-center justify-center bg-stone-100 py-10">
    <div class="w-full max-w-3xl px-4">
        <!-- Form body -->
        <div class="rounded-t-md border border-stone-300 bg-white p-10">
            <!-- Header -->
            <div class="flex w-full items-center gap-3 mb-10">
                <div class="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <BellIcon class="w-4 h-4 text-amber-500" />
                </div>
                <span class="font-semibold text-stone-800">Announcement Detail</span>
                <span class="block h-px flex-1 bg-stone-300"></span>
                <span class={`text-xs font-medium px-2.5 py-1 rounded-full ${announcement.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {announcement.isActive ? "Active" : "Inactive"}
                </span>
            </div>

            <!-- Title -->
            <div class="mb-6">
                <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1.5">Title</p>
                <p class="text-base text-stone-800 font-medium">{announcement.title}</p>
            </div>

            <!-- Content -->
            <div class="mb-6">
                <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1.5">Content</p>
                <p class="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
            </div>

            <!-- Notify To (roles only) -->
            <div class="mb-6">
                <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Notify To</p>
                <div class="flex flex-wrap gap-2">
                    {#each targets as target}
                        <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            {target.roleName}
                        </span>
                    {/each}
                </div>
            </div>

            <!-- Campus -->
            <div>
                <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Campus</p>
                <div class="flex flex-wrap gap-2">
                    {#each targets as target}
                        <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600">
                            {target.campusName}
                        </span>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex w-full items-center justify-between rounded-b-md border border-t-0 border-stone-300 bg-stone-50 px-10 py-5">
            <Button
                type="button"
                variant="outline"
                class="cursor-pointer border-stone-300 text-stone-600 gap-2"
                onclick={() => goto("/app/academic-staff/manage-announcement")}
            >
                <ArrowLeftIcon class="w-4 h-4" />
                Back
            </Button>
            <Button
                type="button"
                class="cursor-pointer bg-amber-600 text-white hover:bg-amber-700 gap-2"
                onclick={() => goto(`/app/academic-staff/manage-announcement/${announcement.announcementId}/update`)}
            >
                <PencilIcon class="w-4 h-4" />
                Edit
            </Button>
        </div>
    </div>
</div>