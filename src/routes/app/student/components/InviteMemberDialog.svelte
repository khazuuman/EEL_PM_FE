<script lang="ts">
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import {
        SearchIcon,
        UserPlusIcon,
        XIcon,
        Loader2Icon,
    } from "lucide-svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button";
    import type { SubmitFunction } from "@sveltejs/kit";

    let {
        open = $bindable(false),
        groupId,
        classId,
        onSuccess,
    }: {
        open: boolean;
        groupId: number;
        classId: number;
        onSuccess?: () => void;
    } = $props();

    type Student = {
        studentId: number;
        studentCode: string;
        fullName: string;
        majorName: string;
    };

    let students = $state<Student[]>([]);
    let search = $state("");
    let selected = $state<number[]>([]);
    let isLoading = $state(false);
    let isFetchingStudents = $state(false);

    let getStudentsForm = $state<HTMLFormElement | null>(null);
    let groupIdInput = $state<HTMLInputElement | null>(null);

    // Fetch danh sách student khi mở dialog
    $effect(() => {
        if (open) {
            selected = [];
            search = "";
            students = [];
            import("svelte").then(({ tick }) =>
                tick().then(() => getStudentsForm?.requestSubmit()),
            );
        }
    });

    const handleGetStudents: SubmitFunction = () => {
        isFetchingStudents = true;
        return async ({ result }) => {
            if (result.type === "success") {
                students = (result.data as any)?.students ?? [];
            }
            isFetchingStudents = false;
        };
    };

    function normalize(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    const filtered = $derived(
        students.filter(
            (s) =>
                normalize(s.fullName).includes(normalize(search)) ||
                normalize(s.studentCode).includes(normalize(search)) ||
                normalize(s.majorName).includes(normalize(search)),
        ),
    );

    function toggleSelect(studentId: number) {
        if (selected.includes(studentId)) {
            selected = selected.filter((id) => id !== studentId);
        } else {
            selected = [...selected, studentId];
        }
    }
</script>

<!-- Hidden form fetch students -->
<form
    method="POST"
    action="?/getAvailableStudent"
    use:enhance={handleGetStudents}
    bind:this={getStudentsForm}
>
    <input type="hidden" name="classId" value={classId} />
</form>

<Dialog.Root bind:open>
    <Dialog.Content class="p-0 gap-0 max-w-275! overflow-hidden">
        <!-- Header -->
        <div
            class="flex items-center justify-between px-6 py-4 border-b border-zinc-100"
        >
            <div>
                <h2
                    class="text-base font-bold text-zinc-900 flex items-center gap-2"
                >
                    <UserPlusIcon class="h-4 w-4 text-amber-500" />
                    Invite Members
                </h2>
                <p class="text-xs text-zinc-400 mt-0.5">
                    Select students without a group to invite.
                </p>
            </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-1 xl:grid-cols-[1fr_360px] max-h-[640px]">
            <!-- LEFT: Student list -->
            <div class="flex flex-col border-r border-zinc-100 min-h-0">
                <!-- Search -->
                <div class="px-5 py-3 border-b border-zinc-100">
                    <div class="relative">
                        <SearchIcon
                            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                        />
                        <input
                            type="text"
                            bind:value={search}
                            placeholder="Search by name, code or major..."
                            class="w-full rounded-lg border border-zinc-200 pl-9 pr-4 py-2 text-sm text-zinc-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-zinc-50"
                        />
                    </div>
                </div>

                <!-- List -->
                <div class="flex-1 overflow-y-auto divide-y divide-zinc-100">
                    {#if isFetchingStudents}
                        <div
                            class="flex flex-col items-center justify-center py-16 gap-3 text-zinc-300"
                        >
                            <Loader2Icon
                                class="w-6 h-6 animate-spin text-amber-400"
                            />
                            <p class="text-xs text-zinc-400">
                                Loading students...
                            </p>
                        </div>
                    {:else if filtered.length === 0}
                        <div
                            class="py-16 text-center text-sm text-zinc-400 italic"
                        >
                            No students found.
                        </div>
                    {:else}
                        {#each filtered as student (student.studentId)}
                            {@const isSelected = selected.includes(
                                student.studentId,
                            )}
                            <button
                                type="button"
                                onclick={() => toggleSelect(student.studentId)}
                                class="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors
                                    {isSelected
                                    ? 'bg-amber-50'
                                    : 'bg-white hover:bg-zinc-50'}"
                            >
                                <div
                                    class="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0"
                                >
                                    {student.fullName.charAt(0)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-sm font-semibold text-zinc-900 truncate"
                                    >
                                        {student.fullName}
                                    </p>
                                    <p
                                        class="text-xs text-zinc-400 truncate mt-0.5 font-mono"
                                    >
                                        {student.studentCode}
                                        <span
                                            class="text-zinc-300 mx-1 font-sans"
                                            >·</span
                                        >
                                        <span class="font-sans"
                                            >{student.majorName}</span
                                        >
                                    </p>
                                </div>
                                <div
                                    class="h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition
                                    {isSelected
                                        ? 'border-amber-500 bg-amber-500'
                                        : 'border-zinc-300 bg-white'}"
                                >
                                    {#if isSelected}
                                        <svg
                                            class="h-3 w-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="3"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    {/if}
                                </div>
                            </button>
                        {/each}
                    {/if}
                </div>

                <!-- Count -->
                <div class="px-5 py-2.5 border-t border-zinc-100 bg-zinc-50/50">
                    <p class="text-xs text-zinc-400">
                        {filtered.length} student{filtered.length !== 1
                            ? "s"
                            : ""} found
                    </p>
                </div>
            </div>

            <!-- RIGHT: Selected + Submit -->
            <div class="flex flex-col min-h-0">
                <!-- Selected header -->
                <div class="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                    <p class="text-sm font-bold text-zinc-700">
                        Selected
                        <span
                            class="ml-1.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-bold"
                        >
                            {selected.length}
                        </span>
                    </p>
                </div>

                <!-- Selected list -->
                <div class="flex-1 overflow-y-auto px-4 py-3">
                    {#if selected.length === 0}
                        <p
                            class="text-sm text-zinc-400 italic text-center py-8"
                        >
                            No student selected yet.
                        </p>
                    {:else}
                        <div class="space-y-2">
                            {#each selected as studentId}
                                {@const student = students.find(
                                    (s) => s.studentId === studentId,
                                )}
                                {#if student}
                                    <div
                                        class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100"
                                    >
                                        <div
                                            class="flex items-center gap-2 min-w-0"
                                        >
                                            <div
                                                class="h-7 w-7 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0"
                                            >
                                                {student.fullName.charAt(0)}
                                            </div>
                                            <div class="min-w-0">
                                                <p
                                                    class="text-xs font-semibold text-zinc-800 truncate"
                                                >
                                                    {student.fullName}
                                                </p>
                                                <p
                                                    class="text-[10px] text-zinc-400 font-mono"
                                                >
                                                    {student.studentCode}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onclick={() =>
                                                toggleSelect(studentId)}
                                            class="text-zinc-400 hover:text-red-500 transition shrink-0 cursor-pointer"
                                        >
                                            <XIcon class="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Submit -->
                <div class="px-4 py-4 border-t border-zinc-100 space-y-2">
                    <form
                        method="POST"
                        action="?/inviteMember"
                        use:enhance={() => {
                            isLoading = true;
                            return async ({ result }) => {
                                isLoading = false;
                                if (result.type === "success") {
                                    toast.success(
                                        "Invitation sent successfully!",
                                    );
                                    selected = [];
                                    open = false;
                                    onSuccess?.();
                                } else if (result.type === "failure") {
                                    toast.error(
                                        (result.data as { message?: string })
                                            ?.message ??
                                            "Failed to invite member.",
                                    );
                                }
                            };
                        }}
                    >
                        <input type="hidden" name="groupId" value={groupId} />
                        {#each selected as studentId}
                            <input
                                type="hidden"
                                name="studentId"
                                value={studentId}
                            />
                        {/each}

                        <button
                            type="submit"
                            disabled={selected.length === 0 || isLoading}
                            class="w-full rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {#if isLoading}
                                <Loader2Icon class="w-4 h-4 animate-spin" />
                                Sending...
                            {:else}
                                <UserPlusIcon class="w-4 h-4" />
                                Invite {selected.length > 0
                                    ? `${selected.length} student${selected.length > 1 ? "s" : ""}`
                                    : ""}
                            {/if}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
