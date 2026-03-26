<script lang="ts">
    import { deserialize, enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Select from "$lib/components/ui/select/index";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    // --- Types ---
    type Campus = { id: number; name: string };
    type ClassItem = { id: number; name: string };
    type Student = { id: number; name: string; studentCode: string };

    let { data }: { data: PageData } = $props();

    // --- Form state ---
    let isSubmitting = $state(false);

    // --- Dropdown state ---
    let campuses = $state<Campus[]>(data.campuses);
    let classes = $state<ClassItem[]>([]);
    let students = $state<Student[]>([]);

    let selectedCampusId = $state<number | null>(null);
    let selectedClassId = $state<number | null>(null);

    const selectedCampusLabel = $derived(
        campuses.find((c) => c.id === selectedCampusId)?.name ??
            "Select campus...",
    );
    const selectedClassLabel = $derived(
        classes.find((c) => c.id === selectedClassId)?.name ??
            "Select class...",
    );

    // --- Student popup state ---
    let showStudentModal = $state(false);
    let selectedStudentIds = $state<Set<number>>(new Set());
    let tempSelectedIds = $state<Set<number>>(new Set());
    let isLoadingClasses = $state(false);
    let isLoadingStudents = $state(false);

    // --- Load classes khi chọn campus (dùng form action) ---
    async function onCampusChange(campusId: number) {
        selectedCampusId = campusId;
        selectedClassId = null;
        classes = [];
        students = [];
        selectedStudentIds = new Set();
        isLoadingClasses = true;

        const fd = new FormData();
        fd.set("campusId", String(campusId));

        const res = await fetch("?/getClassesByCampus", {
            method: "POST",
            body: fd,
            headers: { "x-sveltekit-action": "true" },
        });

        const text = await res.text(); // lấy text thay vì .json()
        const result = deserialize(text); // dùng deserialize của SvelteKit

        if (result.type === "success") {
            classes = (result.data as any)?.classes ?? [];
        } else {
            classes = [];
        }

        isLoadingClasses = false;
    }

    // --- Load students khi chọn class ---
    async function onClassChange(classId: number) {
        selectedClassId = classId;
        students = [];
        selectedStudentIds = new Set();
        isLoadingStudents = true;

        const fd = new FormData();
        fd.set("classId", String(classId));

        const res = await fetch("?/getAvailableStudentByClass", {
            method: "POST",
            body: fd,
            headers: { "x-sveltekit-action": "true" },
        });

        const text = await res.text(); // lấy text thay vì .json()
        const result = deserialize(text);

        if (result.type === "success") {
            students = (result.data as any)?.students ?? [];
        } else {
            students = [];
        }

        isLoadingStudents = false;
    }

    // --- Student modal ---
    function openStudentModal() {
        tempSelectedIds = new Set(selectedStudentIds);
        showStudentModal = true;
    }

    function toggleTempStudent(id: number) {
        const next = new Set(tempSelectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        tempSelectedIds = next;
    }

    function confirmStudents() {
        selectedStudentIds = new Set(tempSelectedIds);
        showStudentModal = false;
    }

    function removeStudent(id: number) {
        const next = new Set(selectedStudentIds);
        next.delete(id);
        selectedStudentIds = next;
    }

    const selectedStudents = $derived(
        students.filter((s) => selectedStudentIds.has(s.id)),
    );

    // --- Submit ---
    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to create group",
                );
            } else if (result.type === "success") {
                toast.success("Group created successfully!");
                await goto("/app/academic-staff/manage-groups");
            }
            await update();
        };
    };
</script>

<!-- Student Selection Modal -->
{#if showStudentModal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="w-[520px] rounded-lg border border-stone-200 bg-white shadow-xl"
        >
            <div
                class="flex items-center justify-between border-b border-stone-200 px-6 py-4"
            >
                <h2 class="font-semibold text-stone-800">Select Students</h2>
                <button
                    type="button"
                    class="text-stone-400 hover:text-stone-600"
                    onclick={() => (showStudentModal = false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            <div class="max-h-72 overflow-y-auto px-6 py-3">
                {#if isLoadingStudents}
                    <p class="py-4 text-center text-sm text-stone-400">
                        Loading...
                    </p>
                {:else if students.length === 0}
                    <p class="py-4 text-center text-sm text-stone-400">
                        No students available
                    </p>
                {:else}
                    {#each students as student}
                        <label
                            class="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 hover:bg-stone-50"
                        >
                            <input
                                type="checkbox"
                                class="h-4 w-4 accent-amber-600"
                                checked={tempSelectedIds.has(student.id)}
                                onchange={() => toggleTempStudent(student.id)}
                            />
                            <span class="font-mono text-xs text-stone-500"
                                >{student.studentCode}</span
                            >
                            <span class="text-sm text-stone-700"
                                >{student.name}</span
                            >
                        </label>
                    {/each}
                {/if}
            </div>

            <div
                class="flex items-center justify-between border-t border-stone-200 px-6 py-4"
            >
                <span class="text-xs text-stone-400"
                    >{tempSelectedIds.size} student(s) selected</span
                >
                <div class="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        class="border-stone-300 text-stone-600"
                        onclick={() => (showStudentModal = false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        class="bg-amber-600 text-white hover:bg-amber-700"
                        onclick={confirmStudents}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Main Form -->
<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100"
>
    <form method="POST" action="?/createGroup" use:enhance={handleSubmit}>
        {#each [...selectedStudentIds] as id}
            <input type="hidden" name="studentIds" value={id} />
        {/each}
        {#if selectedCampusId}
            <input type="hidden" name="campusId" value={selectedCampusId} />
        {/if}
        {#if selectedClassId}
            <input type="hidden" name="classId" value={selectedClassId} />
        {/if}

        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800"
                    >Create New Group</span
                >
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Name + Description -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="name">
                        Group Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="name"
                        id="name"
                        placeholder="e.g. Group A"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="description">Description</Field.Label>
                    <Input
                        name="description"
                        id="description"
                        placeholder="Optional description"
                    />
                </Field.Field>
            </div>

            <!-- Row 2: Campus + Class -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label
                        >Campus<span class="text-orange-500">*</span
                        ></Field.Label
                    >
                    <Select.Root
                        type="single"
                        onValueChange={(val) => onCampusChange(Number(val))}
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-orange-400/20"
                        >
                            <span
                                class={selectedCampusId
                                    ? "text-stone-800"
                                    : "text-stone-400"}
                            >
                                {selectedCampusLabel}
                            </span>
                        </Select.Trigger>
                        <Select.Content>
                            {#each campuses as campus}
                                <Select.Item value={String(campus.id)}>
                                    {campus.name}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label
                        >Class<span class="text-orange-500">*</span
                        ></Field.Label
                    >
                    <Select.Root
                        type="single"
                        disabled={!selectedCampusId}
                        onValueChange={(val) => onClassChange(Number(val))}
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-orange-400/20 disabled:opacity-50"
                        >
                            {#if isLoadingClasses}
                                <span class="text-stone-400">Loading...</span>
                            {:else}
                                <span
                                    class={selectedClassId
                                        ? "text-stone-800"
                                        : "text-stone-400"}
                                >
                                    {selectedCampusId
                                        ? selectedClassLabel
                                        : "Select campus first"}
                                </span>
                            {/if}
                        </Select.Trigger>
                        <Select.Content>
                            {#each classes as cls}
                                <Select.Item value={String(cls.id)}>
                                    {cls.name}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Field.Field>
            </div>

            <!-- Row 3: Students -->
            <div class="mt-6">
                <Field.Field>
                    <div class="mb-2 flex items-center justify-between">
                        <Field.Label>Students</Field.Label>
                        <Button
                            type="button"
                            variant="outline"
                            class="h-7 cursor-pointer border-amber-300 px-3 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                            disabled={!selectedClassId || isLoadingStudents}
                            onclick={openStudentModal}
                        >
                            + Add Students
                        </Button>
                    </div>

                    <div
                        class="min-h-[60px] w-full rounded-md border border-input bg-white px-3 py-2"
                    >
                        {#if selectedStudents.length === 0}
                            <p class="text-sm text-stone-400">
                                {selectedClassId
                                    ? 'No students selected. Click "Add Students" to add.'
                                    : "Select a class first to add students."}
                            </p>
                        {:else}
                            <div class="flex flex-wrap gap-2">
                                {#each selectedStudents as student}
                                    <span
                                        class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                                    >
                                        <span class="font-mono"
                                            >{student.studentCode}</span
                                        >
                                        <span>{student.name}</span>
                                        <button
                                            type="button"
                                            class="ml-0.5 text-amber-500 hover:text-amber-700"
                                            onclick={() =>
                                                removeStudent(student.id)}
                                            >×</button
                                        >
                                    </span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </Field.Field>
            </div>
        </div>

        <!-- Footer -->
        <div
            class="flex w-[800px] items-center justify-between rounded-b-md border border-t-0 border-stone-300 bg-stone-50 px-8 py-5"
        >
            <p class="text-xs text-stone-400">
                <span class="text-orange-500">*</span> Required fields
            </p>
            <div class="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer border-stone-300 text-stone-600"
                    onclick={() => goto("/app/academic-staff/manage-groups")}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    class="cursor-pointer bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                >
                    {#if isSubmitting}
                        <span
                            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></span>
                        Creating...
                    {:else}
                        Create Group
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
