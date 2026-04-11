<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import * as Popover from "$lib/components/ui/popover/index";
    import * as Command from "$lib/components/ui/command/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { toast } from "svelte-sonner";
    import { Check, ChevronsUpDown } from "@lucide/svelte";
    import { cn } from "$lib/utils";

    type Student = { id: number; name: string; studentCode: string };
    type Group = {
        groupId: number | string;
        groupName?: string;
        status?: string;
        members?: { studentId: number; fullName: string; studentCode: string }[];
    };

    let {
        open = $bindable(false),
        group,
        students = [],
        classId,
    }: {
        open: boolean;
        group: Group | null;
        students: Student[];
        classId: number | string;
    } = $props();

    let isSubmitting = $state(false);
    let comboOpen = $state(false);

    // Khởi tạo selectedStudentIds mỗi khi group thay đổi
    let selectedStudentIds = $state<Set<number>>(new Set());
    $effect(() => {
        if (group) {
            selectedStudentIds = new Set(
                group.members?.map((m) => m.studentId) ?? [],
            );
        }
    });

    function toggleStudent(id: number) {
        const next = new Set(selectedStudentIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        selectedStudentIds = next;
    }

    function removeStudent(id: number) {
        const next = new Set(selectedStudentIds);
        next.delete(id);
        selectedStudentIds = next;
    }

    // Merge students available + current members (tránh mất member hiện tại khỏi list)
    const allStudents = $derived((): Student[] => {
        const existingIds = new Set(students.map((s) => s.id));
        const currentMembers: Student[] = (group?.members ?? [])
            .filter((m) => !existingIds.has(m.studentId))
            .map((m) => ({
                id: m.studentId,
                name: m.fullName,
                studentCode: m.studentCode,
            }));
        return [...students, ...currentMembers];
    });

    const selectedStudents = $derived(
        allStudents().filter((s) => selectedStudentIds.has(s.id)),
    );

    function normalize(str: string) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function filterStudent(value: string, search: string) {
        return normalize(value).includes(normalize(search)) ? 1 : 0;
    }

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error((result.data as any)?.message ?? "Failed to update group");
            } else if (result.type === "success") {
                toast.success("Group updated successfully!");
                open = false;
                await invalidateAll();
            }
            await update({ reset: false });
        };
    };
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="max-w-2xl">
        <Dialog.Header>
            <Dialog.Title>Update Group</Dialog.Title>
            <Dialog.Description>
                Group name and code are
                <span class="font-semibold text-stone-700">
                    managed automatically by the system
                </span>
                and cannot be edited.
            </Dialog.Description>
        </Dialog.Header>

        <form method="POST" action="?/update" use:enhance={handleSubmit}>
            {#each [...selectedStudentIds] as id}
                <input type="hidden" name="studentIds" value={id} />
            {/each}
            <input type="hidden" name="groupId" value={group?.groupId} />

            <!-- Group info (read-only) -->
            <div class="flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label>Group Name</Field.Label>
                    <div class="mt-1 flex h-9 w-full items-center rounded-md border border-input bg-stone-50 px-3 text-sm text-stone-500 select-none">
                        {group?.groupName ?? "—"}
                    </div>
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label>Status</Field.Label>
                    <div class="mt-1 flex h-9 w-full items-center rounded-md border border-input bg-stone-50 px-3 text-sm select-none">
                        <span class={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            group?.status === "Draft"
                                ? "bg-stone-100 text-stone-600"
                                : "bg-green-100 text-green-700",
                        )}>
                            {group?.status ?? "—"}
                        </span>
                    </div>
                </Field.Field>
            </div>

            <!-- Info note -->
            <div class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span>You can add or remove students from this group.</span>
                </div>
            </div>

            <!-- Students combobox -->
            <div class="mt-5">
                <Field.Field>
                    <Field.Label>Students</Field.Label>
                    <Popover.Root bind:open={comboOpen}>
                        <Popover.Trigger>
                            {#snippet child({ props })}
                                <Button
                                    {...props}
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboOpen}
                                    class="mt-1 w-full justify-between border-input font-normal text-stone-500 hover:bg-white"
                                >
                                    {selectedStudentIds.size > 0
                                        ? `${selectedStudentIds.size} student(s) selected`
                                        : "Search and select students..."}
                                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            {/snippet}
                        </Popover.Trigger>

                        <Popover.Content
                            class="w-[var(--bits-popover-anchor-width)] p-0"
                            align="start"
                            side="bottom"
                            avoidCollisions={false}
                        >
                            <Command.Root filter={filterStudent}>
                                <Command.Input placeholder="Search by name or student code..." />
                                <Command.Empty>No students found.</Command.Empty>
                                <Command.Group class="max-h-64 overflow-y-auto">
                                    {#each allStudents() as student}
                                        <Command.Item
                                            value={`${student.studentCode} ${student.name}`}
                                            onSelect={() => toggleStudent(student.id)}
                                            class="cursor-pointer"
                                        >
                                            <Check class={cn(
                                                "mr-2 h-4 w-4",
                                                selectedStudentIds.has(student.id)
                                                    ? "opacity-100 text-amber-600"
                                                    : "opacity-0",
                                            )} />
                                            <span class="font-mono text-xs text-stone-500 mr-2">
                                                {student.studentCode}
                                            </span>
                                            <span class="text-sm text-stone-700">
                                                {student.name}
                                            </span>
                                        </Command.Item>
                                    {/each}
                                </Command.Group>
                            </Command.Root>
                        </Popover.Content>
                    </Popover.Root>

                    {#if selectedStudents.length > 0}
                        <div class="mt-2 flex flex-wrap gap-2">
                            {#each selectedStudents as student}
                                <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                                    <span class="font-mono">{student.studentCode}</span>
                                    <span>{student.name}</span>
                                    <button
                                        type="button"
                                        class="ml-0.5 text-amber-500 hover:text-amber-700"
                                        onclick={() => removeStudent(student.id)}
                                    >×</button>
                                </span>
                            {/each}
                        </div>
                    {/if}
                </Field.Field>
            </div>

            <Dialog.Footer class="mt-6">
                <p class="mr-auto text-xs text-stone-400">
                    {selectedStudentIds.size} student(s) selected.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer border-stone-300 text-stone-600"
                    onclick={() => (open = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    class="cursor-pointer bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                >
                    {#if isSubmitting}
                        <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Updating...
                    {:else}
                        Update Group
                    {/if}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>