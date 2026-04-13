<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Field from "$lib/components/ui/field/index";
    import Input from "$lib/components/ui/input/input.svelte";
    import ROLE from "$lib/enums/role";
    import { BellIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    let isSubmitting = $state(false);

    // Danh sách roles — thay bằng data load từ server nếu có
    const roleOptions = [
        { label: "Student", value: ROLE.STUDENT },
        { label: "Lecturer", value: ROLE.LECTURER },
        { label: "Mentor", value: ROLE.MENTOR },
    ];

    const handleSubmit: import("@sveltejs/kit").SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to create announcement",
                );
            } else if (result.type === "success") {
                toast.success("Announcement created successfully!");
                await goto("/app/academic-staff/manage-announcement");
            }
            await update();
        };
    };
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100">
    <form method="POST" action="?/CreateAnnouncement" use:enhance={handleSubmit}>
        <!-- Form body -->
        <div class="w-[640px] rounded-t-md border border-stone-300 bg-white p-8">
            <!-- Title -->
            <div class="flex w-full items-center gap-3 mb-8">
                <div class="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <BellIcon class="w-4 h-4 text-amber-500" />
                </div>
                <span class="font-semibold text-stone-800">Create New Announcement</span>
                <span class="block h-px flex-1 bg-stone-300"></span>
            </div>

            <!-- Title field -->
            <Field.Field>
                <Field.Label for="title">
                    Title<span class="text-orange-500">*</span>
                </Field.Label>
                <Input
                    name="title"
                    id="title"
                    placeholder="e.g. System Maintenance Notice"
                    required
                />
            </Field.Field>

            <!-- Content field -->
            <div class="mt-5">
                <Field.Field>
                    <Field.Label for="content">
                        Content<span class="text-orange-500">*</span>
                    </Field.Label>
                    <textarea
                        name="content"
                        id="content"
                        placeholder="Enter announcement content..."
                        rows={5}
                        required
                        class="border-input w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none resize-none"
                    ></textarea>
                </Field.Field>
            </div>

            <!-- Notify To (roleName checkboxes) -->
            <div class="mt-5">
                <Field.Field>
                    <Field.Label>
                        Notify To<span class="text-orange-500">*</span>
                    </Field.Label>
                    <div class="mt-2 grid grid-cols-2 gap-2">
                        {#each roleOptions as role}
                            <label
                                class="flex items-center gap-2.5 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 cursor-pointer hover:bg-amber-50 hover:border-amber-200 transition-colors has-[:checked]:bg-amber-50 has-[:checked]:border-amber-300"
                            >
                                <input
                                    type="checkbox"
                                    name="roleName"
                                    value={role.value}
                                    class="accent-amber-500 h-4 w-4"
                                />
                                <span class="text-sm text-stone-700">{role.label}</span>
                            </label>
                        {/each}
                    </div>
                </Field.Field>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex w-[640px] items-center justify-between rounded-b-md border border-t-0 border-stone-300 bg-stone-50 px-8 py-5">
            <p class="text-xs text-stone-400">
                <span class="text-orange-500">*</span> Required fields
            </p>
            <div class="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    class="cursor-pointer border-stone-300 text-stone-600"
                    onclick={() => goto("/app/academic-staff/manage-announcement")}
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
                        Creating...
                    {:else}
                        Create Announcement
                    {/if}
                </Button>
            </div>
        </div>
    </form>
</div>