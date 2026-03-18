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
                    (result.data as any)?.message ?? "Failed to create campus",
                );
            } else if (result.type === "success") {
                toast.success("Campus created successfully!");
                await goto("/app/academic-staff/manage-campuses");
            }
            await update();
        };
    };
</script>

<div
    class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100"
>
    <form method="POST" action="?/createCampus" use:enhance={handleSubmit}>
        <!-- Form body -->
        <div
            class="w-[800px] rounded-t-md border border-stone-300 bg-white p-8"
        >
            <!-- Title -->
            <div class="flex w-full items-center gap-3">
                <span class="whitespace-nowrap font-semibold text-stone-800"
                    >Create New Campus</span
                >
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Row 1: Code + Name -->
            <div class="mt-8 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="campusCode">
                        Campus Code<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="campusCode"
                        id="campusCode"
                        placeholder="e.g. HN01"
                        class="font-mono"
                        required
                    />
                </Field.Field>

                <Field.Field class="flex-1">
                    <Field.Label for="campusName">
                        Campus Name<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="campusName"
                        id="campusName"
                        placeholder="e.g. Hanoi Main Campus"
                        required
                    />
                </Field.Field>
            </div>

            <!-- Row 2: City + Status -->
            <div class="mt-6 flex gap-5">
                <Field.Field class="flex-1">
                    <Field.Label for="city">
                        City<span class="text-orange-500">*</span>
                    </Field.Label>
                    <Input
                        name="city"
                        id="city"
                        placeholder="e.g. Hanoi"
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

            <!-- Row 3: Address -->
            <div class="mt-6">
                <Field.Field>
                    <Field.Label for="address">
                        Address<span class="text-orange-500">*</span>
                    </Field.Label>
                    <textarea
                        name="address"
                        id="address"
                        placeholder="e.g. 123 Nguyen Trai, Thanh Xuan, Hanoi"
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
                    onclick={() => goto("/app/academic-staff/manage-campuses")}
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
                        Create Campus
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>
