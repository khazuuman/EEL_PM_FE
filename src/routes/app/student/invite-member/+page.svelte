<script lang="ts">
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import type { PageData } from "../$types";
    import { ArrowLeftIcon } from "lucide-svelte";

    let { data } = $props<{ data: PageData }>();

    let search = $state("");
    let selected = $state<number[]>([]);
    let isLoading = $state(false);

    const filtered = $derived(
        data.students.filter(
            (s: any) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
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

<div class="pt-15">
    <a
        class="flex gap-2 items-center w-fit text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mt-10 mx-10"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <div class="max-w-2xl mx-auto p-6 space-y-5">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold text-stone-800">Invite Members</h1>
            <p class="text-sm text-stone-400 mt-1">
                Select a student without a group to invite.
            </p>
        </div>

        <!-- Search -->
        <div class="relative">
            <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
            </svg>
            <input
                type="text"
                bind:value={search}
                placeholder="Search by name, code or major..."
                class="w-full rounded-lg border border-stone-300 pl-9 pr-4 py-2 text-sm text-stone-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
        </div>

        <!-- Student List -->
        <div
            class="rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden max-h-[420px] overflow-y-auto"
        >
            {#if filtered.length === 0}
                <div class="py-10 text-center text-sm text-stone-400">
                    No students found.
                </div>
            {:else}
                {#each filtered as student (student.studentId)}
                    {@const isSelected = selected.includes(student.studentId)}
                    <button
                        type="button"
                        onclick={() => toggleSelect(student.studentId)}
                        class="w-full flex items-center gap-4 px-4 py-3 text-left transition
            {isSelected ? 'bg-amber-50' : 'bg-white hover:bg-stone-50'}"
                    >
                        <div
                            class="h-9 w-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-500 shrink-0"
                        >
                            {student.name.charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-semibold text-stone-800 truncate"
                            >
                                {student.name}
                            </p>
                            <p class="text-xs text-stone-400 truncate">
                                {student.studentCode} · {student.major}
                            </p>
                        </div>
                        <!-- Checkbox -->
                        <div
                            class="h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center transition
            {isSelected
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-stone-300 bg-white'}"
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

        <!-- Footer -->
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
                            (result.data as { message?: string })?.message ??
                                "Failed to invite member.",
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
            <!-- Gửi nhiều studentId -->
            {#each selected as studentId}
                <input type="hidden" name="studentId" value={studentId} />
            {/each}

            <div class="flex items-center justify-between pt-1">
                <p class="text-sm text-stone-400">
                    {selected.length > 0
                        ? `${selected.length} student(s) selected`
                        : "No student selected"}
                </p>
                <div class="flex gap-3">
                    <button
                        type="button"
                        class="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
                        onclick={() => goto("/app")}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={selected.length === 0 || isLoading}
                        class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Inviting..." : "Invite"}
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
