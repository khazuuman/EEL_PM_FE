<!-- +page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { applyAction } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import {
        ArrowLeftIcon,
        UserIcon,
        MailIcon,
        UsersIcon,
        BuildingIcon,
        ShieldCheckIcon,
        CalendarIcon,
        HashIcon,
        PencilIcon,
        Trash2Icon,
        Loader2Icon,
        PhoneIcon,
        BookOpenIcon,
        GraduationCapIcon,
    } from "lucide-svelte";
    import { setActions } from "$lib/stores/actions";

    let { data }: { data: PageData } = $props();
    const lecturer = $derived(data.lecturerDetails as any);

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
        <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                {#if lecturer?.avatarUrl}
                    <img
                        src={lecturer.avatarUrl}
                        alt={lecturer.fullName}
                        class="w-full h-full object-cover"
                    />
                {:else}
                    <span class="text-xl font-extrabold text-indigo-400">
                        {lecturer?.fullName?.charAt(0) ?? "?"}
                    </span>
                {/if}
            </div>
            <div>
                <p class="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest leading-none mb-0.5">
                    Lecturer
                </p>
                <h1 class="text-2xl font-extrabold text-stone-900 leading-tight">
                    {lecturer?.fullName ?? "—"}
                </h1>
                <p class="text-sm text-stone-400 mt-0.5">
                    {lecturer?.email ?? "—"}
                </p>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-8">

        <!-- Section: Personal Info -->
        <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Personal Information
                </p>
                <div class="border-t border-stone-100 mt-1.5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                <!-- Full Name -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <UserIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Full Name</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{lecturer?.fullName ?? "—"}</p>
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <MailIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Email</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900 break-all">{lecturer?.email ?? "—"}</p>
                </div>

                <!-- Gender -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <UsersIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Gender</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{lecturer?.gender ?? "—"}</p>
                </div>

                <!-- Phone -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <PhoneIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Phone Number</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{lecturer?.phoneNumber ?? "—"}</p>
                </div>

                <!-- Campus -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <BuildingIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Campus</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{lecturer?.campusName ?? "—"}</p>
                </div>

                <!-- Department -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <GraduationCapIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Department</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{lecturer?.department ?? "—"}</p>
                </div>

            </div>
        </section>

        <!-- Section: System Info -->
        <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    System Information
                </p>
                <div class="border-t border-stone-100 mt-1.5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                <!-- Lecturer ID -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <HashIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Lecturer ID</span>
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">{lecturer?.lecturerId ?? "—"}</p>
                </div>

                <!-- Lecturer Code -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <HashIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Lecturer Code</span>
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">{lecturer?.lecturerCode ?? "—"}</p>
                </div>

                <!-- User ID -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <HashIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">User ID</span>
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">{lecturer?.userId ?? "—"}</p>
                </div>

                <!-- Created At -->
                <div class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4">
                    <div class="flex items-center gap-1.5 text-stone-400 mb-0.5">
                        <CalendarIcon class="w-3.5 h-3.5" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Created At</span>
                    </div>
                    <p class="text-base font-semibold text-stone-900">{formatDate(lecturer?.createdAt)}</p>
                </div>

            </div>
        </section>

    </div>
</div>