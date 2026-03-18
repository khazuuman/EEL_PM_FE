<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();
    const semesterId = page.params.id;
    const semester = data.semester;

    let isSubmitting = $state(false);
    let startDate = $state(semester.startDate ?? "");
    let endDate = $state(semester.endDate ?? "");

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

    const duration = $derived.by(() => {
        if (!startDate || !endDate) return null;
        const days = Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24),
        );
        return days > 0 ? { days, weeks: Math.floor(days / 7) } : null;
    });

    const isEndDateInvalid = $derived(!!startDate && !!endDate && !duration);

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ??
                        "Failed to update semester",
                );
            } else if (result.type === "success") {
                toast.success("Semester updated successfully!");
                await goto("/app/academic-staff/manage-semester");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100"
>
    <form method="POST" action={`/app/academic-staff/manage-semester/${semesterId}?/updateSemester`} use:enhance={handleSubmit}>
        <!-- Form body -->
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800"
                    >Update Semester</span
                >
                <span class="block h-px flex-1 bg-stone-300"></span>
                <span class="font-mono text-sm text-stone-400">
                    {semester.semesterCode}
                </span>
            </div>

            <!-- Row 1: Code (readonly) + Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="semesterCode">Semester Code</Field.Label>
                    <Input
                        id="semesterCode"
                        class="font-mono cursor-not-allowed bg-stone-50 text-stone-400"
                        value={semester.semesterCode}
                        disabled
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="semesterName">
                        Semester Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="semesterName"
                        id="semesterName"
                        placeholder="e.g. Spring Semester 2026"
                        value={semester.semesterName}
                        required
                    />
                </Field.Field>
            </div>

            <!-- Row 2: Year + Status + Start + End -->
            <div class="mt-6 flex gap-5">
                <!-- Year -->
                <Field.Field class="flex-1">
                    <Field.Label for="year">
                        Year<span class="text-orange-500">*</span>
                    </Field.Label>
                    <select
                        id="year"
                        name="year"
                        value={semester.year}
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
                        required
                    >
                        {#each years as y}
                            <option value={y}>{y}</option>
                        {/each}
                    </select>
                </Field.Field>

                <!-- Status -->
                <Field.Field class="flex-1">
                    <Field.Label for="isActive">Status</Field.Label>
                    <select
                        id="isActive"
                        name="isActive"
                        value={semester.isActive ? "true" : "false"}
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </Field.Field>

                <!-- Start Date -->
                <Field.Field class="flex-1">
                    <Field.Label for="startDate">
                        Start Date<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        bind:value={startDate}
                        required
                    />
                </Field.Field>

                <!-- End Date -->
                <Field.Field class="flex-1">
                    <Field.Label for="endDate">
                        End Date<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        bind:value={endDate}
                        min={startDate}
                        required
                    />
                    {#if isEndDateInvalid}
                        <p class="mt-1 text-xs text-red-500">
                            End date must be after start date
                        </p>
                    {/if}
                </Field.Field>
            </div>

            <!-- Duration preview -->
            <div class="mt-6 h-8">
                {#if duration}
                    <div
                        class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5"
                    >
                        <span
                            class="h-2 w-2 animate-pulse rounded-full bg-orange-400"
                        ></span>
                        <span class="text-sm font-medium text-orange-700">
                            Duration: <strong>{duration.days} days</strong> ·
                            <strong>{duration.weeks} weeks</strong>
                        </span>
                    </div>
                {/if}
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
                    onclick={() => goto("/app/academic-staff/manage-semester")}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isEndDateInvalid}
                    class="cursor-pointer bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                >
                    {#if isSubmitting}
                        <span
                            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        ></span>
                        Updating...
                    {:else}
                        Update Semester
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
