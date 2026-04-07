<script lang="ts">
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import type { PageData } from "../$types";
    import { ArrowLeftIcon, SearchIcon, UserPlusIcon } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";

    let { data } = $props<{ data: PageData }>();

    let search = $state("");
    let selected = $state<number[]>([]);
    let isLoading = $state(false);

    const filtered = $derived(
        data.students.filter(
            (s: any) =>
                s.fullName.toLowerCase().includes(search.toLowerCase()) ||
                s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
                s.major.toLowerCase().includes(search.toLowerCase()),
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

<div class="min-h-screen bg-white pt-5">
    <!-- Top Bar -->
    <div class="sticky top-0 z-10 pl-3 mb-2 pt-2">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg px-3 py-2 transition-all cursor-pointer"
        >
            <ArrowLeftIcon class="w-4 h-4" />
            <span class="text-sm font-semibold">Back to Home</span>
        </Button>
    </div>

    <div class="px-6 py-4">
        <div
            class="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start"
        >
            <!-- LEFT: Student list -->
            <div
                class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
            >
                <!-- Header -->
                <div class="px-6 py-5 border-b border-zinc-100">
                    <h1
                        class="text-xl font-bold text-zinc-900 flex items-center gap-2"
                    >
                        <UserPlusIcon class="h-5 w-5 text-amber-500" />
                        Invite Members
                    </h1>
                    <p class="text-sm text-zinc-400 mt-1">
                        Select students without a group to invite.
                    </p>
                </div>

                <!-- Search -->
                <div class="px-6 py-4 border-b border-zinc-100">
                    <div class="relative">
                        <SearchIcon
                            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                        />
                        <input
                            type="text"
                            bind:value={search}
                            placeholder="Search by name, code or major..."
                            class="w-full rounded-lg border border-zinc-200 pl-9 pr-4 py-2.5 text-sm text-zinc-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-zinc-50"
                        />
                    </div>
                </div>

                <!-- Student list -->
                <div
                    class="divide-y divide-zinc-100 max-h-[520px] overflow-y-auto"
                >
                    {#if filtered.length === 0}
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
                                class="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors
                                    {isSelected
                                    ? 'bg-amber-50'
                                    : 'bg-white hover:bg-zinc-50'}"
                            >
                                <!-- Avatar -->
                                <div
                                    class="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0"
                                >
                                    {student.fullName.charAt(0)}
                                </div>

                                <!-- Info -->
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
                                            >{student.major}</span
                                        >
                                    </p>
                                </div>

                                <!-- Checkbox -->
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

                <!-- Result count -->
                <div class="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
                    <p class="text-xs text-zinc-400">
                        {filtered.length} student{filtered.length !== 1
                            ? "s"
                            : ""} found
                    </p>
                </div>
            </div>

            <!-- RIGHT: Summary + Submit -->
            <div class="space-y-4 sticky top-20">
                <!-- Selected summary -->
                <div
                    class="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
                >
                    <div
                        class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50"
                    >
                        <h2 class="text-sm font-bold text-zinc-700">
                            Selected
                            <span
                                class="ml-1.5 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-bold"
                            >
                                {selected.length}
                            </span>
                        </h2>
                    </div>

                    <div class="px-5 py-4">
                        {#if selected.length === 0}
                            <p
                                class="text-sm text-zinc-400 italic text-center py-4"
                            >
                                No student selected yet.
                            </p>
                        {:else}
                            <div
                                class="space-y-2 max-h-[280px] overflow-y-auto"
                            >
                                {#each selected as studentId}
                                    {@const student = data.students.find(
                                        (s: any) => s.studentId === studentId,
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
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div class="min-w-0">
                                                    <p
                                                        class="text-xs font-semibold text-zinc-800 truncate"
                                                    >
                                                        {student.name}
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
                                                <svg
                                                    class="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    stroke-width="2.5"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Submit form -->
                <form
                    method="POST"
                    action="?/InviteMember"
                    use:enhance={() => {
                        isLoading = true;
                        return async ({ result }) => {
                            isLoading = false;
                            if (result.type === "success") {
                                toast.success("Invitation sent successfully!");
                                selected = [];
                            } else if (result.type === "failure") {
                                toast.error(
                                    (result.data as { message?: string })
                                        ?.message ?? "Failed to invite member.",
                                );
                            }
                        };
                    }}
                >
                    <input
                        type="hidden"
                        name="groupId"
                        value={data.user.student.group.groupId}
                    />
                    {#each selected as studentId}
                        <input
                            type="hidden"
                            name="studentId"
                            value={studentId}
                        />
                    {/each}

                    <div class="flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={selected.length === 0 || isLoading}
                            class="w-full rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading
                                ? "Sending invitations..."
                                : `Invite ${selected.length > 0 ? selected.length + " student" + (selected.length > 1 ? "s" : "") : ""}`}
                        </button>
                        <button
                            type="button"
                            class="w-full cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
                            onclick={() => goto("/app")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
