<!-- AssignMentorDialog.svelte -->
<script lang="ts">
    import { deserialize, enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        UserRoundSearchIcon,
        CheckIcon,
        UserIcon,
        BuildingIcon,
        LayersIcon,
        Loader2Icon,
        SearchIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        XIcon,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { setActions } from "$lib/stores/actions";

    let {
        open = $bindable(false),
        groupId,
        groupName,
        currentMentorId = null,
        onSuccess,
    }: {
        open: boolean;
        groupId: number;
        groupName: string;
        currentMentorId?: number | null;
        onSuccess?: () => void | Promise<void>;
    } = $props();

    // --- State ---
    let mentors = $state<any[]>([]);
    let pagination = $state({
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0,
    });
    let isLoadingMentors = $state(false);

    // Form fields
    let searchEmail = $state("");
    let selectedMentorId = $state<number | null>(null);
    let selectedMentorName = $state("");
    let manualEmail = $state("");
    let manualFullName = $state("");

    // Mode: "list" | "manual"
    let mode = $state<"list" | "manual">("list");

    // Form refs
    let getMentorsForm = $state<HTMLFormElement | null>(null);
    let pageInput = $state<HTMLInputElement | null>(null);
    let searchInput = $state<HTMLInputElement | null>(null);

    // Debounce search
    let searchTimeout: ReturnType<typeof setTimeout>;

    // --- FIX: Chỉ trigger khi open thay đổi từ false → true ---
    let prevOpen = $state(false);

    $effect(() => {
        if (open && !prevOpen) {
            resetState();
            // Dùng tick để đảm bảo DOM đã render form trước khi submit
            setTimeout(() => fetchMentors(1), 0);
        }
        prevOpen = open;
    });

    function resetState() {
        mentors = [];
        pagination = { page: 1, limit: 20, totalItems: 0, totalPages: 0 };
        searchEmail = "";
        selectedMentorId = null;
        selectedMentorName = "";
        manualEmail = "";
        manualFullName = "";
        mode = "list";
    }

    // --- Fetch mentors ---
    const handleGetMentors: SubmitFunction = () => {
        isLoadingMentors = true;
        return async ({ result, update }) => {
            await update({ reset: false });
            if (result.type === "success") {
                mentors = (result.data as any)?.mentors ?? [];
                // FIX: Cập nhật pagination mà không trigger $effect
                const newPagination = (result.data as any)?.pagination;
                if (newPagination) {
                    // Giữ lại page hiện tại vì server trả về đúng
                    pagination = {
                        page: newPagination.page ?? pagination.page,
                        limit: newPagination.limit ?? pagination.limit,
                        totalItems: newPagination.totalItems ?? 0,
                        totalPages: newPagination.totalPages ?? 0,
                    };
                }
            }
            isLoadingMentors = false;
        };
    };

    // FIX: fetchMentors không cập nhật pagination.page (tránh trigger $effect)
    function fetchMentors(page: number) {
        if (pageInput) pageInput.value = String(page);
        if (searchInput) searchInput.value = searchEmail;
        getMentorsForm?.requestSubmit();
    }

    function onSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => fetchMentors(1), 400);
    }

    // --- Chọn mentor từ list ---
    function selectMentor(mentor: any) {
        const id = mentor.mentorId ?? mentor.id;
        if (currentMentorId != null && id === currentMentorId) return;
        if (selectedMentorId === id) {
            selectedMentorId = null;
            selectedMentorName = "";
        } else {
            selectedMentorId = id;
            selectedMentorName = mentor.fullName ?? "";
            mode = "list";
            manualEmail = "";
            manualFullName = "";
        }
    }

    // --- Switch sang manual mode ---
    function switchToManual() {
        mode = "manual";
        selectedMentorId = null;
        selectedMentorName = "";
    }

    // --- Assign ---
    function handleAssign() {
        const isManual = mode === "manual";

        if (isManual) {
            if (!manualEmail.trim()) {
                toast.error("Please enter mentor email.");
                return;
            }
        } else {
            if (!selectedMentorId) {
                toast.error("Please select a mentor.");
                return;
            }
        }

        const displayName = isManual
            ? manualFullName.trim() || manualEmail.trim()
            : selectedMentorName;

        setActions({
            active: true,
            description: `Assign mentor "${displayName}" to group "${groupName}"? This action can be changed later.`,
            cb: async () => {
                const formData = new FormData();
                formData.append("groupId", String(groupId));

                if (isManual) {
                    formData.append("mentorEmail", manualEmail.trim());
                    if (manualFullName.trim()) {
                        formData.append(
                            "mentorFullName",
                            manualFullName.trim(),
                        );
                    }
                } else {
                    formData.append("mentorId", String(selectedMentorId));
                }

                const res = await fetch("?/assignMentor", {
                    method: "POST",
                    body: formData,
                    headers: { "x-sveltekit-action": "true" },
                });

                const result = deserialize(await res.text()) as any;

                if (result?.type === "failure") {
                    const message = Array.isArray(result?.data?.message)
                        ? result.data.message[1]
                        : (result?.data?.message ?? "Failed to assign mentor.");
                    toast.error(message);
                    return;
                }

                await onSuccess?.();
                toast.success(`Mentor "${displayName}" assigned successfully!`);
                open = false;
            },
        });
    }

    // Derived
    let canAssign = $derived(
        mode === "manual"
            ? manualEmail.trim().length > 0
            : selectedMentorId !== null,
    );
</script>

<!-- Hidden forms for server actions -->
<form
    method="POST"
    action="?/getMentors"
    use:enhance={handleGetMentors}
    bind:this={getMentorsForm}
>
    <input type="hidden" name="page" bind:this={pageInput} value="1" />
    <input type="hidden" name="email" bind:this={searchInput} value="" />
</form>

<Dialog.Root
    bind:open
    onOpenChange={(v) => {
        if (!v) resetState();
    }}
>
    <Dialog.Content class="p-0 gap-0 overflow-hidden !max-w-[560px]">
        <div class="flex flex-col h-[620px]">
            <!-- Header -->
            <div class="px-5 py-4 border-b border-stone-100 shrink-0">
                <h2 class="text-sm font-bold text-stone-900">Assign Mentor</h2>
                <p class="text-xs text-stone-400 mt-0.5">
                    Selecting for <span class="font-semibold text-stone-600"
                        >{groupName}</span
                    >
                </p>
            </div>

            <!-- Tabs: List vs Manual -->
            <div class="flex border-b border-stone-100 shrink-0">
                <button
                    type="button"
                    onclick={() => {
                        mode = "list";
                        selectedMentorId = null;
                        manualEmail = "";
                        manualFullName = "";
                    }}
                    class="flex-1 py-2.5 text-xs font-semibold transition-colors
                        {mode === 'list'
                        ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/40'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}"
                >
                    Select from List
                </button>
                <button
                    type="button"
                    onclick={switchToManual}
                    class="flex-1 py-2.5 text-xs font-semibold transition-colors
                        {mode === 'manual'
                        ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/40'
                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}"
                >
                    Enter Manually
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-hidden flex flex-col">
                {#if mode === "list"}
                    <!-- Search -->
                    <div class="px-4 pt-3 pb-2 shrink-0">
                        <div class="relative">
                            <SearchIcon
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300 pointer-events-none"
                            />
                            <Input
                                type="email"
                                placeholder="Filter by email..."
                                bind:value={searchEmail}
                                oninput={onSearchInput}
                                class="pl-8 pr-8 text-sm h-8 font-mono"
                            />
                            {#if searchEmail}
                                <button
                                    type="button"
                                    onclick={() => {
                                        searchEmail = "";
                                        fetchMentors(1);
                                    }}
                                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                                >
                                    <XIcon class="w-3.5 h-3.5" />
                                </button>
                            {/if}
                        </div>
                    </div>

                    <!-- Mentor List -->
                    <div class="flex-1 overflow-y-auto px-4 pb-2 space-y-1.5">
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
                                    No mentors found
                                </p>
                                {#if searchEmail}
                                    <p class="text-xs text-stone-400">
                                        No results for "<span class="font-mono"
                                            >{searchEmail}</span
                                        >".
                                        <button
                                            type="button"
                                            onclick={switchToManual}
                                            class="text-amber-500 hover:underline font-medium"
                                            >Assign manually?</button
                                        >
                                    </p>
                                {/if}
                            </div>
                        {:else}
                            {#each mentors as mentor}
                                {@const mentorId = mentor.mentorId ?? mentor.id}
                                {@const isSelected =
                                    selectedMentorId === mentorId}
                                {@const isCurrent =
                                    currentMentorId != null &&
                                    mentorId === currentMentorId}

                                <button
                                    type="button"
                                    onclick={() =>
                                        !isCurrent && selectMentor(mentor)}
                                    disabled={isCurrent}
                                    class="w-full text-left rounded-xl border px-4 py-3 transition-all duration-150
                                        {isCurrent
                                        ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                                        : isSelected
                                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                                          : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50 cursor-pointer'}"
                                >
                                    <div class="flex items-start gap-3">
                                        <div
                                            class="h-8 w-8 shrink-0 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm"
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
                                                {#if isCurrent}
                                                    <Badge
                                                        class="text-[10px] font-bold bg-stone-100 text-stone-400 border-stone-200 border shrink-0"
                                                    >
                                                        Current
                                                    </Badge>
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
                                                class="text-xs text-stone-400 font-mono truncate mt-0.5"
                                            >
                                                {mentor.email ?? "—"}
                                            </p>
                                            <div
                                                class="flex items-center gap-2 mt-1.5 flex-wrap"
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

                    <!-- Pagination -->
                    {#if pagination.totalPages > 1}
                        <div
                            class="flex items-center justify-between px-4 py-2.5 border-t border-stone-100 shrink-0"
                        >
                            <p class="text-xs text-stone-400">
                                {pagination.totalItems} mentors · Page {pagination.page}
                                of {pagination.totalPages}
                            </p>
                            <div class="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="h-7 w-7"
                                    disabled={pagination.page <= 1 ||
                                        isLoadingMentors}
                                    onclick={() =>
                                        fetchMentors(pagination.page - 1)}
                                >
                                    <ChevronLeftIcon class="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    class="h-7 w-7"
                                    disabled={pagination.page >=
                                        pagination.totalPages ||
                                        isLoadingMentors}
                                    onclick={() =>
                                        fetchMentors(pagination.page + 1)}
                                >
                                    <ChevronRightIcon class="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    {/if}
                {:else}
                    <!-- Manual Entry Form -->
                    <div class="flex-1 px-6 py-5 space-y-4">
                        <p class="text-xs text-stone-400 leading-relaxed">
                            Enter the mentor's email directly. If no account is
                            found in the system, they will be invited.
                        </p>

                        <div class="space-y-1.5">
                            <Label
                                for="manualEmail"
                                class="text-sm font-medium text-stone-700"
                            >
                                Email <span class="text-red-400">*</span>
                            </Label>
                            <Input
                                id="manualEmail"
                                type="email"
                                placeholder="mentor@example.com"
                                bind:value={manualEmail}
                                class="font-mono text-sm"
                                required
                            />
                        </div>

                        <div class="space-y-1.5">
                            <Label
                                for="manualFullName"
                                class="text-sm font-medium text-stone-700"
                            >
                                Full Name <span
                                    class="text-stone-400 font-normal"
                                    >(optional)</span
                                >
                            </Label>
                            <Input
                                id="manualFullName"
                                type="text"
                                placeholder="e.g. John Doe"
                                bind:value={manualFullName}
                                class="text-sm"
                            />
                        </div>

                        <div
                            class="rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3"
                        >
                            <p class="text-xs text-amber-700 leading-relaxed">
                                <strong>Note:</strong> No mentor ID will be sent
                                when assigning manually. The system will look up
                                the mentor by email.
                            </p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div
                class="px-5 py-3.5 border-t border-stone-100 bg-white shrink-0 flex items-center justify-between gap-3"
            >
                <div class="min-w-0">
                    {#if mode === "list" && selectedMentorId}
                        <p class="text-xs text-stone-500 truncate">
                            Selected: <span class="font-semibold text-stone-800"
                                >{selectedMentorName}</span
                            >
                        </p>
                    {:else if mode === "manual" && manualEmail}
                        <p class="text-xs text-stone-500 truncate font-mono">
                            {manualEmail}
                        </p>
                    {:else}
                        <p class="text-xs text-stone-400">No mentor selected</p>
                    {/if}
                </div>

                <Button
                    class="bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shrink-0 min-w-36"
                    disabled={!canAssign}
                    onclick={handleAssign}
                >
                    <CheckIcon class="w-4 h-4 mr-2" />
                    Assign to {groupName}
                </Button>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
