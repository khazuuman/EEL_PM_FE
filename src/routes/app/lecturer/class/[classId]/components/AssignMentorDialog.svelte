<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        UserRoundSearchIcon,
        ChevronRightIcon,
        CheckIcon,
        UserIcon,
        MailIcon,
        PhoneIcon,
        BriefcaseIcon,
        ArrowLeftIcon,
        Loader2Icon,
        BuildingIcon,
        LayersIcon,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { setActions } from "$lib/stores/actions";

    let {
        open = $bindable(false),
        groupId,
        groupName,
        currentMentorId = null,
    }: {
        open: boolean;
        groupId: number;
        groupName: string;
        currentMentorId?: number | null;
    } = $props();

    let mentors = $state<any[]>([]);
    let selectedMentor = $state<any | null>(null);
    let isLoadingMentors = $state(false);
    let isLoadingDetail = $state(false);
    let loadingMentorId = $state<string | number | null>(null);

    let getMentorsForm = $state<HTMLFormElement | null>(null);
    let getMentorDetailForm = $state<HTMLFormElement | null>(null);
    let mentorIdInput = $state<HTMLInputElement | null>(null);

    $effect(() => {
        if (open) {
            selectedMentor = null;
            import("svelte").then(({ tick }) =>
                tick().then(() => getMentorsForm?.requestSubmit()),
            );
        }
    });

    const handleGetMentors: SubmitFunction = () => {
        isLoadingMentors = true;
        return async ({ result, update }) => {
            await update();
            if (result.type === "success") {
                mentors = (result.data as any)?.mentors ?? [];
            }
            isLoadingMentors = false;
        };
    };

    const handleGetMentorDetail: SubmitFunction = () => {
        isLoadingDetail = true;
        return async ({ result, update }) => {
            await update();
            if (result.type === "success") {
                selectedMentor = (result.data as any)?.mentorDetails ?? null;
            }
            isLoadingDetail = false;
            loadingMentorId = null;
        };
    };

    function selectMentor(mentor: any) {
        const id = mentor.mentorId ?? mentor.id;
        // Không gọi lại nếu đã đang hiển thị mentor này
        if ((selectedMentor?.mentorId ?? selectedMentor?.id) === id) return;
        loadingMentorId = id;
        if (mentorIdInput) mentorIdInput.value = String(id);
        getMentorDetailForm?.requestSubmit();
    }

    function handleAssign() {
        if (!selectedMentor) return;
        setActions({
            active: true,
            description: `Assign mentor "${selectedMentor.fullName}" to group "${groupName}"? This action can be changed later.`,
            cb: async () => {
                const formData = new FormData();
                formData.append("groupId", String(groupId));
                formData.append(
                    "mentorId",
                    String(selectedMentor.mentorId ?? selectedMentor.id),
                );
                const res = await fetch("?/assignMentor", {
                    method: "POST",
                    body: formData,
                });
                const result = await res.json();
                if (result?.type === "failure") {
                    toast.error(
                        result?.data?.message ?? "Failed to assign mentor.",
                    );
                    return;
                }
                toast.success(
                    `Mentor "${selectedMentor.fullName}" assigned successfully!`,
                );
                open = false;
                selectedMentor = null;
                await invalidateAll();
            },
        });
    }
</script>

<form
    method="POST"
    action="?/getMentors"
    use:enhance={handleGetMentors}
    bind:this={getMentorsForm}
></form>
<form
    method="POST"
    action="?/getMentorDetail"
    use:enhance={handleGetMentorDetail}
    bind:this={getMentorDetailForm}
>
    <input type="hidden" name="mentorId" bind:this={mentorIdInput} />
</form>

<Dialog.Root
    bind:open
    onOpenChange={(v) => {
        if (!v) selectedMentor = null;
    }}
>
    <Dialog.Content
        class="p-0 gap-0 overflow-hidden transition-all duration-300 {selectedMentor
            ? '!max-w-[900px]'
            : '!max-w-[500px]'}"
    >
        <div class="flex h-150">
            <!-- Panel trái -->
            <div
                class="flex flex-col {selectedMentor
                    ? 'w-[500px] shrink-0 border-r border-stone-100'
                    : 'w-full'}"
            >
                <div class="px-5 py-4 border-b border-stone-100">
                    <h2 class="text-sm font-bold text-stone-900">
                        Assign Mentor
                    </h2>
                    <p class="text-xs text-stone-400 mt-0.5">
                        Selecting for <span class="font-semibold text-stone-600"
                            >{groupName}</span
                        >
                    </p>
                </div>

                <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {#if isLoadingMentors}
                        <div
                            class="flex flex-col items-center justify-center h-full gap-3 text-stone-300"
                        >
                            <Loader2Icon class="w-7 h-7 animate-spin" />
                            <p class="text-xs">Loading mentors...</p>
                        </div>
                    {:else if mentors.length === 0}
                        <div
                            class="flex flex-col items-center justify-center h-full gap-2 text-stone-300"
                        >
                            <UserRoundSearchIcon class="w-9 h-9" />
                            <p class="text-sm font-medium text-stone-400">
                                No mentors available
                            </p>
                        </div>
                    {:else}
                        {#each mentors as mentor}
                            {@const mentorId = mentor.mentorId ?? mentor.id}
                            {@const isSelected =
                                (selectedMentor?.mentorId ??
                                    selectedMentor?.id) === mentorId}
                            {@const isLoadingThis =
                                loadingMentorId === mentorId}
                            {@const isCurrent =
                                currentMentorId != null &&
                                mentorId === currentMentorId}

                            <button
                                type="button"
                                onclick={() =>
                                    !isCurrent && selectMentor(mentor)}
                                disabled={isSelected || isCurrent}
                                class="w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150
               {isCurrent
                                    ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                                    : isSelected
                                      ? 'bg-amber-50 border-amber-300 shadow-sm cursor-default'
                                      : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50 cursor-pointer'}"
                            >
                                <div class="flex items-start gap-3">
                                    <div
                                        class="h-9 w-9 shrink-0 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm"
                                    >
                                        {mentor.fullName?.charAt(0) ?? "?"}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="flex items-center justify-between gap-2"
                                        >
                                            <p
                                                class="text-sm font-semibold text-stone-900 truncate"
                                            >
                                                {mentor.fullName ?? "—"}
                                            </p>
                                            <!-- ✅ icon theo trạng thái -->
                                            {#if isCurrent}
                                                <Badge
                                                    class="text-[10px] font-bold bg-stone-100 text-stone-400 border-stone-200 border shrink-0"
                                                >
                                                    Current
                                                </Badge>
                                            {:else if isLoadingThis}
                                                <Loader2Icon
                                                    class="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0"
                                                />
                                            {:else if isSelected}
                                                <CheckIcon
                                                    class="w-3.5 h-3.5 text-amber-500 shrink-0"
                                                />
                                            {:else}
                                                <ChevronRightIcon
                                                    class="w-3.5 h-3.5 text-stone-300 shrink-0"
                                                />
                                            {/if}
                                        </div>
                                        <p
                                            class="text-xs text-stone-400 truncate mt-0.5"
                                        >
                                            {mentor.email ?? "—"}
                                        </p>
                                        <!-- các badge field giữ nguyên -->
                                        <div
                                            class="flex items-center gap-3 mt-2 flex-wrap"
                                        >
                                            {#if mentor.currentPosition}
                                                <span
                                                    class="flex items-center gap-1 text-xs text-stone-500"
                                                >
                                                    <UserIcon
                                                        class="w-3 h-3 text-stone-300"
                                                    />
                                                    {mentor.currentPosition}
                                                </span>
                                            {/if}
                                            {#if mentor.currentCompany}
                                                <span
                                                    class="flex items-center gap-1 text-xs text-stone-500"
                                                >
                                                    <BuildingIcon
                                                        class="w-3 h-3 text-stone-300"
                                                    />
                                                    {mentor.currentCompany}
                                                </span>
                                            {/if}
                                            {#if mentor.fieldOfWork}
                                                <span
                                                    class="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5"
                                                >
                                                    <LayersIcon
                                                        class="w-2.5 h-2.5"
                                                    />
                                                    {mentor.fieldOfWork}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Panel phải: Detail -->
            {#if selectedMentor}
                <div
                    class="flex flex-col flex-1 min-w-0 animate-in slide-in-from-right-4 duration-200"
                >
                    <div
                        class="flex items-center gap-3 px-5 py-4 border-b border-stone-100"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            class="w-8 h-8 text-stone-400 hover:text-stone-700 cursor-pointer shrink-0"
                            onclick={() => (selectedMentor = null)}
                        >
                            <ArrowLeftIcon class="w-4 h-4" />
                        </Button>
                        <div>
                            <h3 class="text-sm font-bold text-stone-900">
                                Mentor Details
                            </h3>
                            <p class="text-xs text-stone-400">
                                Review before assigning
                            </p>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        <div class="flex items-center gap-4">
                            <div
                                class="h-14 w-14 shrink-0 rounded-full bg-amber-100 flex items-center justify-center font-extrabold text-amber-700 text-xl"
                            >
                                {selectedMentor.fullName?.charAt(0) ?? "?"}
                            </div>
                            <div>
                                <p
                                    class="text-lg font-extrabold text-stone-900"
                                >
                                    {selectedMentor.fullName ?? "—"}
                                </p>
                                {#if selectedMentor.expertise}
                                    <Badge
                                        class="mt-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold"
                                    >
                                        {selectedMentor.expertise}
                                    </Badge>
                                {/if}
                            </div>
                        </div>

                        <div
                            class="rounded-xl border border-stone-100 bg-stone-50/60 divide-y divide-stone-100"
                        >
                            {#each [{ icon: MailIcon, label: "Email", value: selectedMentor.email }, { icon: PhoneIcon, label: "Phone", value: selectedMentor.phone }, { icon: BriefcaseIcon, label: "Department", value: selectedMentor.department }, { icon: UserIcon, label: "Code", value: selectedMentor.mentorCode ?? selectedMentor.lecturerCode }, { icon: UserIcon, label: "Position", value: selectedMentor.currentPosition }, { icon: BuildingIcon, label: "Company", value: selectedMentor.currentCompany }, { icon: LayersIcon, label: "Field of Work", value: selectedMentor.fieldOfWork }].filter((f) => f.value) as field}
                                <div class="flex items-start gap-3 px-4 py-3">
                                    <svelte:component
                                        this={field.icon}
                                        class="w-4 h-4 text-stone-400 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p class="text-xs text-stone-400">
                                            {field.label}
                                        </p>
                                        <p
                                            class="text-sm font-semibold text-stone-900 break-all"
                                        >
                                            {field.value}
                                        </p>
                                    </div>
                                </div>
                            {/each}
                        </div>

                        {#if selectedMentor.bio}
                            <div>
                                <p
                                    class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2"
                                >
                                    Bio
                                </p>
                                <p
                                    class="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap"
                                >
                                    {selectedMentor.bio}
                                </p>
                            </div>
                        {/if}
                    </div>

                    <div class="px-6 py-4 border-t border-stone-100 bg-white">
                        <Button
                            class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer"
                            onclick={handleAssign}
                        >
                            <CheckIcon class="w-4 h-4 mr-2" />
                            Assign to {groupName}
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
