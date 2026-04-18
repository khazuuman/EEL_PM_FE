<!-- +page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        ArrowLeftIcon,
        UserPlusIcon,
        UserIcon,
        MailIcon,
        UsersIcon,
        BuildingIcon,
        Loader2Icon,
    } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    let isSubmitting = $state(false);

    const handleSubmit: SubmitFunction = () => {
        isSubmitting = true;
        return async ({ result, update }) => {
            isSubmitting = false;
            if (result.type === "success") {
                toast.success("Staff created successfully");
                goto("/app/admin/manage-staff");
            } else if (result.type === "failure") {
                toast.error((result.data as any)?.message ?? "Failed to create staff");
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
    <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
            <UserPlusIcon class="w-5 h-5 text-orange-500" />
        </div>
        <div>
            <p class="text-[11px] font-semibold text-orange-500 uppercase tracking-widest leading-none mb-0.5">
                Admin
            </p>
            <h1 class="text-2xl font-extrabold text-stone-900 leading-tight">
                Create Staff
            </h1>
        </div>
    </div>

    <!-- Form -->
    <form
        method="POST"
        action="?/createStaff"
        use:enhance={handleSubmit}
        class="flex flex-col gap-8"
    >
        <!-- Section: Personal Info -->
        <div class="flex flex-col gap-1 mb-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Personal Information
            </p>
            <div class="border-t border-stone-100 mt-1.5"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- Full Name -->
            <div class="flex flex-col gap-2">
                <Label for="fullName" class="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                    <UserIcon class="w-3.5 h-3.5 text-stone-400" />
                    Full Name
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="e.g. Nguyen Van A"
                    required
                    class="border-stone-200 focus-visible:ring-orange-400 h-10"
                />
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2">
                <Label for="email" class="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                    <MailIcon class="w-3.5 h-3.5 text-stone-400" />
                    Email
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. nguyenvana@fpt.edu.vn"
                    required
                    class="border-stone-200 focus-visible:ring-orange-400 h-10"
                />
            </div>

            <!-- Gender -->
            <div class="flex flex-col gap-2">
                <Label class="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                    <UsersIcon class="w-3.5 h-3.5 text-stone-400" />
                    Gender
                    <span class="text-orange-500 text-xs">*</span>
                </Label>
                <div class="flex items-center gap-1 p-1 rounded-lg border border-stone-200 bg-stone-50 w-fit">
                    {#each [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }] as opt, i}
                        <label class="relative cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value={opt.value}
                                required
                                class="peer sr-only"
                            />
                            <span class="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium text-stone-500
                                peer-checked:bg-white peer-checked:text-orange-600 peer-checked:font-semibold
                                peer-checked:shadow-sm peer-checked:border peer-checked:border-orange-200
                                hover:text-stone-800 transition-all cursor-pointer select-none">
                                {opt.label}
                            </span>
                        </label>
                    {/each}
                </div>
            </div>

            <!-- Campus -->
            <div class="flex flex-col gap-2">
                <Label for="campusId" class="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
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
                    <option value="" disabled selected>Select a campus…</option>
                    {#each data.campuses as campus}
                        <option value={campus.campusId}>
                            [{campus.campusCode}] {campus.campusName}
                        </option>
                    {/each}
                </select>
            </div>

        </div>

        <!-- Divider -->
        <div class="border-t border-stone-100"></div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
            <Button
                type="submit"
                disabled={isSubmitting}
                class="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer gap-2 h-10 px-6 rounded-lg"
            >
                {#if isSubmitting}
                    <Loader2Icon class="w-4 h-4 animate-spin" />
                    Creating…
                {:else}
                    <UserPlusIcon class="w-4 h-4" />
                    Create Staff
                {/if}
            </Button>
            <Button
                type="button"
                variant="ghost"
                onclick={() => history.back()}
                disabled={isSubmitting}
                class="text-stone-400 hover:text-stone-700 cursor-pointer h-10 px-5"
            >
                Cancel
            </Button>
        </div>

    </form>
</div>