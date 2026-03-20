<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Select from "$lib/components/ui/select/index";
    import { toast } from "svelte-sonner";

    const { data } = $props();
    console.log("campuses: ", data.campuses);

    let isSubmitting = $state(false);

    // Select binding states
    let selectedGender = $state("");
    let selectedCampusId = $state("");
    let selectedMajorId = $state("");
    let selectedClassId = $state("");

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to create student",
                );
            } else if (result.type === "success") {
                toast.success("Student created successfully!");
                await goto("/app/academic-staff/manage-academic-data");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100 pt-12"
>
    <form method="POST" action="?/createStudent" use:enhance={handleSubmit}>
        <!-- Hidden inputs for Select values (shadcn Select không tự submit qua form) -->
        <input type="hidden" name="gender" value={selectedGender} />
        <input type="hidden" name="campusId" value={selectedCampusId} />
        <input type="hidden" name="majorId" value={selectedMajorId} />
        <input type="hidden" name="classId" value={selectedClassId} />

        <!-- Form body -->
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800">
                    Create New Student
                </span>
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Student Code + Full Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="studentCode">
                        Student Code<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="studentCode"
                        id="studentCode"
                        placeholder="e.g. SE123456"
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
            </div>

            <!-- Row 2: Gender + Date of Birth -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label>
                        Gender<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Select.Root
                        type="single"
                        bind:value={selectedGender}
                        required
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        >
                            {selectedGender || "Select gender"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="Male">Male</Select.Item>
                            <Select.Item value="Female">Female</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="dateOfBirth">
                        Date of Birth<span class="text-orange-500">*</span>
                    </Field.Label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        required
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none
                                [&::-webkit-calendar-picker-indicator]:invert-[0.4]
                                [&::-webkit-calendar-picker-indicator]:sepia
                                [&::-webkit-calendar-picker-indicator]:saturate-[3]
                                [&::-webkit-calendar-picker-indicator]:hue-rotate-[330deg]"
                    />
                </Field.Field>
            </div>

            <!-- Row 3: Phone Number + Campus -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="phoneNumber">Phone Number</Field.Label>
                    <Input
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="e.g. 0912345678"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label>
                        Campus<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Select.Root
                        type="single"
                        bind:value={selectedCampusId}
                        required
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        >
                            {data.campuses.find(
                                (c: any) =>
                                    String(c.campusId) === selectedCampusId,
                            )?.campusName || "Select campus"}
                        </Select.Trigger>
                        <Select.Content>
                            {#each data.campuses as campus}
                                <Select.Item value={String(campus.campusId)}>
                                    {campus.campusName}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Field.Field>
            </div>

            <!-- Row 4: Major + Class -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label>
                        Major<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Select.Root
                        type="single"
                        bind:value={selectedMajorId}
                        required
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        >
                            {data.majors.find(
                                (m: any) =>
                                    String(m.majorId) === selectedMajorId,
                            )?.majorName || "Select major"}
                        </Select.Trigger>
                        <Select.Content>
                            {#each data.majors as major}
                                <Select.Item value={String(major.majorId)}>
                                    {major.majorName}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label>
                        Class<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Select.Root
                        type="single"
                        bind:value={selectedClassId}
                        required
                    >
                        <Select.Trigger
                            class="w-full focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                        >
                            {data.classes.find(
                                (c: any) =>
                                    String(c.classId) === selectedClassId,
                            )?.className || "Select class"}
                        </Select.Trigger>
                        <Select.Content>
                            {#each data.classes as cls}
                                <Select.Item value={String(cls.classId)}>
                                    {cls.className}
                                </Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </Field.Field>
            </div>

            <!-- Row 5: Enrollment Year + Current Semester -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="enrollmentYear">
                        Enrollment Year
                    </Field.Label>
                    <Input
                        type="number"
                        name="enrollmentYear"
                        id="enrollmentYear"
                        placeholder="e.g. 2024"
                        min="2000"
                        max="2100"
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="currentSemester">
                        Current Semester
                    </Field.Label>
                    <Input
                        type="number"
                        name="currentSemester"
                        id="currentSemester"
                        placeholder="e.g. 1"
                        min="1"
                    />
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
                    onclick={() =>
                        goto("/app/academic-staff/manage-academic-data")}
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
                        Create Student
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
