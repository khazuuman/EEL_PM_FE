<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import { toast } from "svelte-sonner";

    let isSubmitting = $state(false);

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to create course",
                );
            } else if (result.type === "success") {
                toast.success("Course created successfully!");
                await goto("/app/academic-staff/manage-courses");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100"
>
    <form method="POST" action="?/createCourse" use:enhance={handleSubmit}>
        <!-- Form body -->
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800"
                    >Create New Course</span
                >
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Code + Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="courseCode">
                        Course Code<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="courseCode"
                        id="courseCode"
                        placeholder="e.g. CS101"
                        class="font-mono"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="courseName">
                        Course Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="courseName"
                        id="courseName"
                        placeholder="e.g. Introduction to Computer Science"
                        required
                    />
                </Field.Field>
            </div>

            <!-- Row 2: Credits + isActive -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="credits">
                        Credits<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        type="number"
                        name="credits"
                        id="credits"
                        placeholder="e.g. 3"
                        min="1"
                        max="10"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="isActive">Status</Field.Label>
                    <select
                        id="isActive"
                        name="isActive"
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
                    >
                        <option value="true" selected>Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </Field.Field>
            </div>

            <!-- Row 3: Description -->
            <div class="mt-6">
                <Field.Field>
                    <Field.Label for="courseDescription">
                        Description
                    </Field.Label>
                    <textarea
                        name="courseDescription"
                        id="courseDescription"
                        placeholder="Enter course description..."
                        rows={4}
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none resize-none"
                    ></textarea>
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
                    onclick={() => goto("/app/academic-staff/manage-courses")}
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
                        Create Course
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
