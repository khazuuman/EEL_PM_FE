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
                    (result.data as any)?.message ?? "Failed to create mentor",
                );
            } else if (result.type === "success") {
                toast.success("Mentor created successfully!");
                await goto("/app/academic-staff/manage-mentors");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100 pt-12"
>
    <form method="POST" action="?/createMentor" use:enhance={handleSubmit}>
        <!-- Form body -->
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800">
                    Create New Mentor
                </span>
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Mentor Code + Full Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="mentorCode">
                        Mentor Code<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="mentorCode"
                        id="mentorCode"
                        placeholder="e.g. MT001"
                        class="font-mono"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="fullName">
                        Full Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="fullName"
                        id="fullName"
                        placeholder="e.g. Nguyen Van A"
                        required
                    />
                </Field.Field>
            </div>

            <!-- Row 2: Email + Phone Number -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="email">
                        Email<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="e.g. nguyenvana@example.com"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="phoneNumber">Phone Number</Field.Label>
                    <Input
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="e.g. 0912345678"
                    />
                </Field.Field>
            </div>

            <!-- Row 3: Current Company + Current Position -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="currentCompany">
                        Current Company
                    </Field.Label>
                    <Input
                        name="currentCompany"
                        id="currentCompany"
                        placeholder="e.g. FPT Software"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="currentPosition">
                        Current Position
                    </Field.Label>
                    <Input
                        name="currentPosition"
                        id="currentPosition"
                        placeholder="e.g. Senior Developer"
                    />
                </Field.Field>
            </div>

            <!-- Row 4: Field of Work + Years of Experience -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="fieldOfWork">Field of Work</Field.Label>
                    <Input
                        name="fieldOfWork"
                        id="fieldOfWork"
                        placeholder="e.g. Software Engineering"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="yearsOfExperience">
                        Years of Experience
                    </Field.Label>
                    <Input
                        type="number"
                        name="yearsOfExperience"
                        id="yearsOfExperience"
                        placeholder="e.g. 5"
                        min="0"
                    />
                </Field.Field>
            </div>

            <!-- Row 5: Biography -->
            <div class="mt-6">
                <Field.Field>
                    <Field.Label for="biography">Biography</Field.Label>
                    <textarea
                        name="biography"
                        id="biography"
                        placeholder="e.g. Experienced software engineer with a passion for mentoring..."
                        rows={3}
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
                    onclick={() => goto("/app/academic-staff/manage-mentors")}
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
                        Create Mentor
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
