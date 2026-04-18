<!-- +page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { enhance } from "$app/forms";
    import { redirect, type SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { goto, invalidateAll } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        ArrowLeftIcon,
        SaveIcon,
        UserIcon,
        MailIcon,
        UsersIcon,
        BuildingIcon,
        Loader2Icon,
        Trash2Icon,
        ShieldCheckIcon,
        ShieldOffIcon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    const staff = $derived(data.staffDetails as any);

    let isSubmitting = $state(false);
    let isDeleting = $state(false);

    const handleUpdate: SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
                toast.success("Staff updated successfully");
                await invalidateAll();
                history.back();
            } else if (result.type === "failure") {
                toast.error(
                    (result.data as any)?.message ?? "Failed to update staff",
                );
                await update();
            }
        };
    };
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
    <div class="flex items-start justify-between mb-8 gap-4">
        <div class="flex items-center gap-3">
            <div
                class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0"
            >
                <UserIcon class="w-5 h-5 text-orange-500" />
            </div>
            <div>
                <p
                    class="text-[11px] font-semibold text-orange-500 uppercase tracking-widest leading-none mb-0.5"
                >
                    Admin · Staff
                </p>
                <h1
                    class="text-2xl font-extrabold text-stone-900 leading-tight"
                >
                    {staff?.fullName ?? "Update Staff"}
                </h1>
            </div>
        </div>

        <!-- Staff meta badges -->
        <div class="flex items-center gap-2 flex-wrap justify-end">
            <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono font-semibold text-stone-500"
            >
                {staff?.staffCode ?? "—"}
            </span>
            {#if staff?.isActive}
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
        </div>
    </div>

    <!-- Update Form -->
    <form
        method="POST"
        action={`?/updateStaff`}
        use:enhance={handleUpdate}
        class="flex flex-col gap-8"
    >
        <!-- Section label -->
        <div class="flex flex-col gap-1">
            <p
                class="text-[10px] font-bold uppercase tracking-widest text-stone-400"
            >
                Personal Information
            </p>
            <div class="border-t border-stone-100 mt-1.5"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div class="flex flex-col gap-2">
                <Label
                    for="fullName"
                    class="text-sm font-semibold text-stone-700 flex items-center gap-1.5"
                >
                    <UserIcon class="w-3.5 h-3.5 text-stone-400" />
                    Full Name
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={staff?.fullName ?? ""}
                    required
                    class="border-stone-200 focus-visible:ring-orange-400 h-10"
                />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2">
                <Label
                    for="email"
                    class="text-sm font-semibold text-stone-700 flex items-center gap-1.5"
                >
                    <MailIcon class="w-3.5 h-3.5 text-stone-400" />
                    Email
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={staff?.email ?? ""}
                    required
                    class="border-stone-200 focus-visible:ring-orange-400 h-10"
                />
            </div>

            <!-- Gender -->
            <div class="flex flex-col gap-2">
                <Label
                    class="text-sm font-semibold text-stone-700 flex items-center gap-1.5"
                >
                    <UsersIcon class="w-3.5 h-3.5 text-stone-400" />
                    Gender
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <div
                    class="flex items-center gap-1 p-1 rounded-lg border border-stone-200 bg-stone-50 w-fit"
                >
                    {#each [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }] as opt}
                        <label class="relative cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={opt.value}
                                checked={staff?.gender === opt.value}
                                required
                                class="peer sr-only"
                            />
                            <span
                                class="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium text-stone-500
                                peer-checked:bg-white peer-checked:text-orange-600 peer-checked:font-semibold
                                peer-checked:shadow-sm peer-checked:border peer-checked:border-orange-200
                                hover:text-stone-800 transition-all cursor-pointer select-none"
                            >
                                {opt.label}
                            </span>
                        </label>
                    {/each}
                </div>
            </div>

            <!-- Campus -->
            <div class="flex flex-col gap-2">
                <Label
                    for="campusId"
                    class="text-sm font-semibold text-stone-700 flex items-center gap-1.5"
                >
                    <BuildingIcon class="w-3.5 h-3.5 text-stone-400" />
                    Campus
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <select
                    id="campusId"
                    name="campusId"
                    required
                    class="w-full h-10 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800
                           shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                           transition cursor-pointer"
                >
                    <option value="" disabled>Select a campus…</option>
                    {#each data.campuses as campus}
                        <option
                            value={campus.campusId}
                            selected={campus.campusId === staff?.campusId}
                        >
                            [{campus.campusCode}] {campus.campusName}
                        </option>
                    {/each}
                </select>
            </div>

            <!-- Is Active -->
            <div class="flex flex-col gap-2">
                <Label
                    class="text-sm font-semibold text-stone-700 flex items-center gap-1.5"
                >
                    <ShieldCheckIcon class="w-3.5 h-3.5 text-stone-400" />
                    Status
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <div
                    class="flex items-center gap-1 p-1 rounded-lg border border-stone-200 bg-stone-50 w-fit"
                >
                    {#each [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] as opt}
                        <label class="relative cursor-pointer">
                            <input
                                type="radio"
                                name="isActive"
                                value={opt.value}
                                checked={String(staff?.isActive) === opt.value}
                                required
                                class="peer sr-only"
                            />
                            <span
                                class="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium text-stone-500
                                peer-checked:bg-white peer-checked:font-semibold peer-checked:shadow-sm
                                peer-checked:border transition-all cursor-pointer select-none
                                {opt.value === 'true'
                                    ? 'peer-checked:text-green-700 peer-checked:border-green-200'
                                    : 'peer-checked:text-red-600 peer-checked:border-red-200'}
                                hover:text-stone-800"
                            >
                                {opt.label}
                            </span>
                        </label>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-stone-100"></div>

        <!-- Actions -->
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <Button
                    type="submit"
                    disabled={isSubmitting || isDeleting}
                    class="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer gap-2 h-10 px-6 rounded-lg"
                >
                    {#if isSubmitting}
                        <Loader2Icon class="w-4 h-4 animate-spin" />
                        Saving…
                    {:else}
                        <SaveIcon class="w-4 h-4" />
                        Save Changes
                    {/if}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onclick={() => history.back()}
                    disabled={isSubmitting || isDeleting}
                    class="text-stone-400 hover:text-stone-700 cursor-pointer h-10 px-5"
                >
                    Cancel
                </Button>
            </div>
        </div>
    </form>
</div>
