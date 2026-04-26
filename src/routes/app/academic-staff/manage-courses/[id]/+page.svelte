<!-- +page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";
    import { setActions } from "$lib/stores/actions";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Table from "$lib/components/ui/table/index.js";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import {
        ArrowLeftIcon,
        BookOpenIcon,
        HashIcon,
        CalendarIcon,
        ShieldCheckIcon,
        ShieldOffIcon,
        LayersIcon,
        PencilIcon,
        Trash2Icon,
        PlusIcon,
        Loader2Icon,
        SaveIcon,
        XIcon,
        PercentIcon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();
    const course = $derived(data.courseDetails as any);
    const gradeItems = $derived(data.gradeItems as any[]);

    // ── Edit inline state ──────────────────────────────────────────
    let editingId = $state<number | null>(null);
    let editName = $state("");
    let editWeight = $state(0);

    // ── Create form state ──────────────────────────────────────────
    let showCreateForm = $state(false);
    let createName = $state("");
    let createWeight = $state(0);

    // ── Loading states ─────────────────────────────────────────────
    let isSavingEdit = $state(false);
    let isCreating = $state(false);
    let deletingId = $state<number | null>(null);

    // ── Hidden form refs ───────────────────────────────────────────
    let deleteFormEl = $state<HTMLFormElement | null>(null);
    let deletingGradeItemId = $state<number | null>(null);

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

    function startEdit(item: any) {
        editingId = item.gradeItemId;
        editName = item.name;
        editWeight = item.weight;
    }

    function cancelEdit() {
        editingId = null;
        editName = "";
        editWeight = 0;
    }

    function confirmDelete(item: any) {
        deletingGradeItemId = item.gradeItemId;
        setActions({
            active: true,
            description: `Are you sure you want to delete grade item "${item.name}"? This action cannot be undone.`,
            cb: async () => {
                deleteFormEl?.requestSubmit();
            },
        });
    }

    const handleUpdate: SubmitFunction = () => {
        isSavingEdit = true;
        return async ({ result, update }) => {
            isSavingEdit = false;
            if (result.type === "success") {
                toast.success("Grade item updated successfully");
                cancelEdit();
                await invalidateAll();
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ??
                        "Failed to update grade item",
                );
                await update();
            }
        };
    };

    const handleCreate: SubmitFunction = () => {
        isCreating = true;
        return async ({ result, update }) => {
            isCreating = false;
            if (result.type === "success") {
                toast.success("Grade item created successfully");
                showCreateForm = false;
                createName = "";
                createWeight = 0;
                await invalidateAll();
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ??
                        "Failed to create grade item",
                );
                await update();
            }
        };
    };

    const handleDelete: SubmitFunction = () => {
        deletingId = deletingGradeItemId;
        return async ({ result, update }) => {
            deletingId = null;
            deletingGradeItemId = null;
            if (result.type === "success") {
                toast.success("Grade item deleted successfully");
                await invalidateAll();
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ??
                        "Failed to delete grade item",
                );
                await update();
            }
        };
    };

    const totalWeight = $derived(
        gradeItems.reduce(
            (sum: number, item: any) => sum + (item.weight ?? 0),
            0,
        ),
    );
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
                class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"
            >
                <BookOpenIcon class="w-5 h-5 text-blue-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-blue-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Course Details
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    {course?.courseName ?? "—"}
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-end">
            <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono font-semibold text-stone-500"
            >
                {course?.courseCode ?? "—"}
            </span>
            {#if course?.isActive}
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
                    goto(
                        `/app/academic-staff/manage-courses/${course?.courseId}/update`,
                    )}
                class="h-9 px-4 gap-2 text-sm font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
            >
                <PencilIcon class="w-3.5 h-3.5" />
                Edit
            </Button>
        </div>
    </div>

    <div class="flex flex-col gap-8">
        <!-- Section: Course Info -->
        <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p
                    class="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                >
                    Course Information
                </p>
                <div class="border-t border-stone-100 mt-1.5"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <BookOpenIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Course Name</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {course?.courseName ?? "—"}
                    </p>
                </div>

                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <HashIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Course Code</span
                        >
                    </div>
                    <p class="text-base font-semibold font-mono text-stone-900">
                        {course?.courseCode ?? "—"}
                    </p>
                </div>

                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <LayersIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Credits</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {course?.credits ?? "—"}
                    </p>
                </div>

                <div
                    class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4"
                >
                    <div
                        class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                    >
                        <LayersIcon class="w-3.5 h-3.5" />
                        <span
                            class="text-[10px] font-bold uppercase tracking-widest"
                            >Course Level</span
                        >
                    </div>
                    <p class="text-base font-semibold text-stone-900">
                        {course?.courseLevel ?? "—"}
                    </p>
                    <p class="text-xs text-stone-400">
                        Used for FAP sync ordering
                    </p>
                </div>

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
                        {formatDate(course?.createdAt)}
                    </p>
                </div>

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
                        {formatDate(course?.updatedAt)}
                    </p>
                </div>

                {#if course?.courseDescription}
                    <div
                        class="flex flex-col gap-1.5 rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4 md:col-span-2 xl:col-span-3"
                    >
                        <div
                            class="flex items-center gap-1.5 text-stone-400 mb-0.5"
                        >
                            <BookOpenIcon class="w-3.5 h-3.5" />
                            <span
                                class="text-[10px] font-bold uppercase tracking-widest"
                                >Description</span
                            >
                        </div>
                        <p
                            class="text-base font-semibold text-stone-900 whitespace-pre-line"
                        >
                            {course.courseDescription}
                        </p>
                    </div>
                {/if}
            </div>
        </section>

        <!-- Section: Grade Items -->
        <section class="flex flex-col gap-4 w-full xl:w-[50vw]">
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-1 flex-1">
                    <div class="flex items-center gap-3">
                        <p
                            class="text-[10px] font-bold uppercase tracking-widest text-stone-400"
                        >
                            Grade Items
                        </p>
                        <span
                            class="text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 rounded-full px-2.5 py-0.5"
                        >
                            {gradeItems.length}
                        </span>
                        <!-- Total weight indicator -->
                        <span
                            class="text-xs font-semibold px-2.5 py-0.5 rounded-full border
                            {totalWeight === 100
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : totalWeight > 100
                                  ? 'bg-red-100 text-red-600 border-red-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200'}"
                        >
                            Total: {totalWeight}%
                        </span>
                    </div>
                    <div class="border-t border-stone-100 mt-1.5"></div>
                </div>
                <Button
                    variant="outline"
                    onclick={() => {
                        showCreateForm = !showCreateForm;
                    }}
                    class="ml-4 h-8 px-3 gap-1.5 text-xs font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                    <PlusIcon class="w-3.5 h-3.5" />
                    Add Grade Item
                </Button>
            </div>

            <!-- Create Form -->
            {#if showCreateForm}
                <form
                    method="POST"
                    action="?/createGradeItem"
                    use:enhance={handleCreate}
                    class="rounded-xl border border-blue-200 bg-blue-50/40 px-5 py-4 flex flex-wrap items-end gap-4"
                >
                    <input
                        type="hidden"
                        name="courseId"
                        value={course?.courseId}
                    />

                    <div class="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                        <Label
                            for="createName"
                            class="text-xs font-semibold text-stone-600"
                        >
                            Name <span class="text-blue-500">*</span>
                        </Label>
                        <Input
                            id="createName"
                            name="name"
                            type="text"
                            placeholder="e.g. Midterm"
                            bind:value={createName}
                            required
                            class="h-9 border-stone-200 focus-visible:ring-blue-400 bg-white"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5 w-32">
                        <Label
                            for="createWeight"
                            class="text-xs font-semibold text-stone-600"
                        >
                            Weight (%) <span class="text-blue-500">*</span>
                        </Label>
                        <Input
                            id="createWeight"
                            name="weight"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            bind:value={createWeight}
                            required
                            class="h-9 border-stone-200 focus-visible:ring-blue-400 bg-white"
                        />
                    </div>

                    <div class="flex items-center gap-2">
                        <Button
                            type="submit"
                            disabled={isCreating}
                            class="h-9 px-4 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                            {#if isCreating}
                                <Loader2Icon class="w-3.5 h-3.5 animate-spin" />
                                Creating…
                            {:else}
                                <PlusIcon class="w-3.5 h-3.5" />
                                Create
                            {/if}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onclick={() => {
                                showCreateForm = false;
                                createName = "";
                                createWeight = 0;
                            }}
                            class="h-9 px-3 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                            <XIcon class="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </form>
            {/if}

            <!-- Table -->
            <div class="rounded-xl border border-stone-200 overflow-hidden">
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-stone-50 hover:bg-stone-50">
                            <Table.Head
                                class="w-12 text-center text-stone-400 font-semibold"
                                >#</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold"
                                >Name</Table.Head
                            >
                            <Table.Head class="text-stone-600 font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <PercentIcon class="w-3.5 h-3.5" /> Weight
                                </div>
                            </Table.Head>
                            <!-- <Table.Head class="text-stone-600 font-semibold text-center">Status</Table.Head> -->
                            <Table.Head
                                class="text-stone-600 font-semibold text-center"
                                >Actions</Table.Head
                            >
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if gradeItems.length === 0}
                            <Table.Row>
                                <Table.Cell
                                    colspan={5}
                                    class="py-16 text-center"
                                >
                                    <div
                                        class="flex flex-col items-center gap-2 text-stone-300"
                                    >
                                        <LayersIcon class="w-10 h-10" />
                                        <p
                                            class="text-sm font-semibold text-stone-400"
                                        >
                                            No grade items yet
                                        </p>
                                        <p class="text-xs text-stone-300">
                                            Click "Add Grade Item" to create one
                                        </p>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each gradeItems as item, i (item.gradeItemId)}
                                <Table.Row
                                    class="hover:bg-stone-50/60 transition-colors"
                                >
                                    <Table.Cell
                                        class="text-center text-stone-400 text-sm font-mono"
                                        >{i + 1}</Table.Cell
                                    >

                                    <!-- Name cell: view or edit -->
                                    <Table.Cell>
                                        {#if editingId === item.gradeItemId}
                                            <Input
                                                name="name"
                                                form="editForm-{item.gradeItemId}"
                                                type="text"
                                                bind:value={editName}
                                                required
                                                class="h-8 w-48 border-stone-200 focus-visible:ring-blue-400 text-sm"
                                            />
                                        {:else}
                                            <span
                                                class="text-sm font-semibold text-stone-900"
                                                >{item.name}</span
                                            >
                                        {/if}
                                    </Table.Cell>

                                    <!-- Weight cell -->
                                    <Table.Cell>
                                        {#if editingId === item.gradeItemId}
                                            <Input
                                                name="weight"
                                                form="editForm-{item.gradeItemId}"
                                                type="number"
                                                min="0"
                                                max="100"
                                                bind:value={editWeight}
                                                required
                                                class="h-8 w-24 border-stone-200 focus-visible:ring-blue-400 text-sm"
                                            />
                                        {:else}
                                            <span
                                                class="inline-flex items-center gap-1 text-sm font-semibold text-stone-800"
                                            >
                                                {item.weight}<span
                                                    class="text-xs font-normal text-stone-400"
                                                    >%</span
                                                >
                                            </span>
                                        {/if}
                                    </Table.Cell>

                                    <!-- Status
                                    <Table.Cell class="text-center">
                                        {#if item.isActive}
                                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-200 text-xs font-semibold text-green-700">
                                                <ShieldCheckIcon class="w-3 h-3" /> Active
                                            </span>
                                        {:else}
                                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-500">
                                                <ShieldOffIcon class="w-3 h-3" /> Inactive
                                            </span>
                                        {/if}
                                    </Table.Cell> -->

                                    <!-- Actions -->
                                    <Table.Cell class="text-center">
                                        {#if editingId === item.gradeItemId}
                                            <div
                                                class="flex items-center justify-center gap-1"
                                            >
                                                <Button
                                                    type="submit"
                                                    form="editForm-{item.gradeItemId}"
                                                    disabled={isSavingEdit}
                                                    class="h-7 px-3 gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                                >
                                                    {#if isSavingEdit}
                                                        <Loader2Icon
                                                            class="w-3 h-3 animate-spin"
                                                        />
                                                    {:else}
                                                        <SaveIcon
                                                            class="w-3 h-3"
                                                        />
                                                    {/if}
                                                    Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onclick={cancelEdit}
                                                    disabled={isSavingEdit}
                                                    class="h-7 px-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                                                >
                                                    <XIcon
                                                        class="w-3.5 h-3.5"
                                                    />
                                                </Button>
                                            </div>
                                        {:else}
                                            <div
                                                class="flex items-center justify-center gap-1"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onclick={() =>
                                                        startEdit(item)}
                                                    class="h-7 px-3 gap-1 text-xs text-stone-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                                >
                                                    <PencilIcon
                                                        class="w-3.5 h-3.5"
                                                    />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onclick={() =>
                                                        confirmDelete(item)}
                                                    disabled={deletingId ===
                                                        item.gradeItemId}
                                                    class="h-7 px-3 gap-1 text-xs text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                >
                                                    {#if deletingId === item.gradeItemId}
                                                        <Loader2Icon
                                                            class="w-3.5 h-3.5 animate-spin"
                                                        />
                                                    {:else}
                                                        <Trash2Icon
                                                            class="w-3.5 h-3.5"
                                                        />
                                                    {/if}
                                                    Delete
                                                </Button>
                                            </div>
                                        {/if}
                                    </Table.Cell>
                                </Table.Row>

                                <!-- Hidden edit form per row -->
                                <form
                                    id="editForm-{item.gradeItemId}"
                                    method="POST"
                                    action="?/updateGradeItem"
                                    use:enhance={handleUpdate}
                                    class="hidden"
                                >
                                    <input
                                        type="hidden"
                                        name="gradeItemId"
                                        value={item.gradeItemId}
                                    />
                                    <input
                                        type="hidden"
                                        name="name"
                                        value={editName}
                                    />
                                    <input
                                        type="hidden"
                                        name="weight"
                                        value={editWeight}
                                    />
                                </form>
                            {/each}
                        {/if}
                    </Table.Body>
                </Table.Root>
            </div>
        </section>
    </div>
</div>

<!-- Hidden delete form -->
<form
    bind:this={deleteFormEl}
    method="POST"
    action="?/deleteGradeItem"
    use:enhance={handleDelete}
    class="hidden"
>
    <input type="hidden" name="gradeItemId" value={deletingGradeItemId} />
</form>
