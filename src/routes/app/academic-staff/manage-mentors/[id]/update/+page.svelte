<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import { toast } from "svelte-sonner";

    const { data } = $props();

    let isSubmitting = $state(false);

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to update mentor",
                );
            } else if (result.type === "success") {
                toast.success("Mentor updated successfully!");
                await goto("/app/academic-staff/manage-mentors");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100 pt-50"
>
    <form
        method="POST"
        action="/app/academic-staff/manage-mentors/${data?.mentor
            ?.mentorId}?/updateMentor"
        use:enhance={handleSubmit}
    >
        <input type="hidden" name="mentorId" value={data?.mentor?.mentorId} />
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800">
                    Update Mentor
                </span>
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Mentor Code + Full Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="mentorCode">Mentor Code</Field.Label>
                    <Input
                        name="mentorCode"
                        id="mentorCode"
                        value={data.mentor?.mentorCode}
                        class="font-mono bg-stone-50 text-stone-400 cursor-not-allowed"
                        disabled
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="fullName">
                        Full Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="fullName"
                        id="fullName"
                        value={data.mentor?.fullName}
                        placeholder="e.g. Nguyen Van A"
                        required
                    />
                </Field.Field>
            </div>

            <!-- Row 2: Email + Phone Number -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="email">Email</Field.Label>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        value={data.mentor?.email}
                        class="bg-stone-50 text-stone-400 cursor-not-allowed"
                        disabled
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="phoneNumber">Phone Number</Field.Label>
                    <Input
                        name="phoneNumber"
                        id="phoneNumber"
                        value={data.mentor?.phoneNumber ?? ""}
                        placeholder="e.g. 0912345678"
                    />
                </Field.Field>
            </div>

            <!-- Row 3: Current Company + Current Position -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="currentCompany"
                        >Current Company</Field.Label
                    >
                    <Input
                        name="currentCompany"
                        id="currentCompany"
                        value={data.mentor?.currentCompany ?? ""}
                        placeholder="e.g. FPT Software"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="currentPosition"
                        >Current Position</Field.Label
                    >
                    <Input
                        name="currentPosition"
                        id="currentPosition"
                        value={data.mentor?.currentPosition ?? ""}
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
                        value={data.mentor?.fieldOfWork ?? ""}
                        placeholder="e.g. Software Engineering"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="yearsOfExperience"
                        >Years of Experience</Field.Label
                    >
                    <Input
                        type="number"
                        name="yearsOfExperience"
                        id="yearsOfExperience"
                        value={data.mentor?.yearsOfExperience ?? ""}
                        placeholder="e.g. 5"
                        min="0"
                    />
                </Field.Field>
            </div>

            <!-- Row 5: isActive -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="isActive">Status</Field.Label>
                    <select
                        id="isActive"
                        name="isActive"
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none"
                    >
                        <option
                            value="true"
                            selected={data.mentor?.isActive === true}
                            >Active</option
                        >
                        <option
                            value="false"
                            selected={data.mentor?.isActive === false}
                            >Inactive</option
                        >
                    </select>
                </Field.Field>
            </div>

            <!-- Row 6: Biography -->
            <div class="mt-6">
                <Field.Field>
                    <Field.Label for="biography">Biography</Field.Label>
                    <textarea
                        name="biography"
                        id="biography"
                        placeholder="e.g. Experienced software engineer..."
                        rows={3}
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none resize-none"
                        >{data.mentor?.biography ?? ""}</textarea
                    >
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
                        Updating...
                    {:else}
                        Update Mentor
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
