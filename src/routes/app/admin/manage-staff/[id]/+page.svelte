<!-- +page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        ArrowLeftIcon,
        UserIcon,
        MailIcon,
        UsersIcon,
        BuildingIcon,
        ShieldCheckIcon,
        ShieldOffIcon,
        CalendarIcon,
        HashIcon,
        PencilIcon,
        Trash2Icon,
        Loader2Icon,
    } from "lucide-svelte";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { applyAction, enhance } from "$app/forms";
    import { setActions } from "$lib/stores/actions";

    let { data }: { data: PageData } = $props();
    const staff = $derived(data.staffDetails as any);

    function formatDate(val: string | undefined): string {
        if (!val) return "—";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${HH}:${min}`;
    }
    let isDeleting = $state(false);
    let deleteFormEl = $state<HTMLFormElement | null>(null);

    const handleDelete: SubmitFunction = () => {
        isDeleting = true;
        return async ({ result }) => {
            isDeleting = false;
            if (result.type === "redirect") {
                toast.success("Staff deleted successfully");
                await goto(result.location);
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to delete staff",
                );
                await applyAction(result);
            }
        };
    };

    function confirmDelete() {
        setActions({
            active: true,
            description: `Are you sure you want to delete "${staff?.fullName}"? This action cannot be undone.`,
            cb: async () => {
                deleteFormEl?.requestSubmit();
            },
        });
    }
</script>

<div class="bg-white w-full min-h-screen px-10 pt-6 pb-12">
    <!-- Back -->
    <div class="flex items-center h-10 mb-2">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 cursor-pointer -ml-3"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            Back
        </Button>
    </div>

    <!-- Page Header -->
    <div class="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0"
            >
                <UserIcon class="w-5 h-5 text-orange-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-orange-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Admin · Staff
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    {staff?.fullName ?? "—"}
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-end">
            <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono font-semibold text-stone-500"
            >
                {staff?.staffCode ?? "—"}
            </span>
            {#if staff?.isActive}
                <span
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 border border-green-200 text-xs font-semibold text-green-700"
                >
                    <ShieldCheckIcon class="w-3.5 h-3.5" />
                    Active
                </span>
            {:else}
                <span
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 border border-red-200 text-xs font-semibold text-red-600"
                >
                    <ShieldOffIcon class="w-3.5 h-3.5" />
                    Inactive
                </span>
            {/if}

            <Button
                variant="outline"
                onclick={() =>
                    goto(`/app/admin/manage-staff/${staff?.staffId}/update`)}
                class="h-9 px-4 gap-2 text-sm font-semibold border-orange-200 text-orange-600 hover:bg-orange-50 cursor-pointer"
            >
                <PencilIcon class="w-3.5 h-3.5" />
                Edit
            </Button>

            <Button
                variant="ghost"
                onclick={confirmDelete}
                disabled={isDeleting}
                class="h-9 px-4 gap-2 text-sm font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
                {#if isDeleting}
                    <Loader2Icon class="w-3.5 h-3.5 animate-spin" />
                    Deleting…
                {:else}
                    <Trash2Icon class="w-3.5 h-3.5" />
                    Delete
                {/if}
            </Button>
        </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-8">
        <!-- Section: Personal Info -->
        <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p
                    class="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                >
                    Personal Information
                </p>
                <div class="border-t border-stone-100 mt-1.5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <!-- Full Name -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <UserIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Full Name</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {staff?.fullName ?? "—"}
                    </p>
                </div>

                <!-- Email -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <MailIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Email</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900 break-all">
                        {staff?.email ?? "—"}
                    </p>
                </div>

                <!-- Gender -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <UsersIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Gender</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {staff?.gender ?? "—"}
                    </p>
                </div>

                <!-- Campus -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <BuildingIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Campus</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {staff?.campusName ?? "—"}
                    </p>
                </div>

                <!-- Staff Code -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <HashIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Staff Code</span
                        >
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">
                        {staff?.staffCode ?? "—"}
                    </p>
                </div>

                <!-- Status -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <ShieldCheckIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Status</span
                        >
                    </div>
                    {#if staff?.isActive}
                        <span
                            class="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700"
                        >
                            <ShieldCheckIcon class="w-4 h-4 text-green-500" />
                            Active
                        </span>
                    {:else}
                        <span
                            class="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600"
                        >
                            <ShieldOffIcon class="w-4 h-4 text-red-400" />
                            Inactive
                        </span>
                    {/if}
                </div>
            </div>
        </section>

        <!-- Section: System Info -->
        <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p
                    class="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                >
                    System Information
                </p>
                <div class="border-t border-stone-100 mt-1.5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <!-- Staff ID -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <HashIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Staff ID</span
                        >
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">
                        {staff?.staffId ?? "—"}
                    </p>
                </div>

                <!-- User ID -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <HashIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >User ID</span
                        >
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">
                        {staff?.userId ?? "—"}
                    </p>
                </div>

                <!-- Created At -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <CalendarIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Created At</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {formatDate(staff?.createdAt)}
                    </p>
                </div>

                <!-- Updated At -->
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <CalendarIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Updated At</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {formatDate(staff?.updatedAt)}
                    </p>
                </div>
            </div>
        </section>
    </div>
</div>
<form
    bind:this={deleteFormEl}
    method="POST"
    action="?/delete"
    use:enhance={handleDelete}
    class="hidden"
></form>
