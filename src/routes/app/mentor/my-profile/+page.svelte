<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import {
        ArrowLeftIcon,
        BriefcaseIcon,
        CameraIcon,
        ClockIcon,
        FileTextIcon,
        IdCardIcon,
        Loader2Icon,
        PhoneIcon,
        UserIcon,
        WrenchIcon,
    } from "lucide-svelte";
    import type { ActionData, PageData } from "./$types";
    import type { UserProfileDto } from "$lib/types/user";
    import Input from "$lib/components/ui/input/input.svelte";
    import { deserialize, enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { invalidate } from "$app/navigation";
    import { setActions } from "$lib/stores/actions";

    // ─── Props & State ────────────────────────────────────────
    let { data, form } = $props<{ data: PageData; form: ActionData }>();
    let user = $derived(data.user as UserProfileDto);
    let isEditing = $state(false);
    let isSubmitting = $state(false);
    let isUploadingAvatar = $state(false);
    let avatarError = $state(false);

    const getInitials = (name: string) =>
        name.trim().split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");

    const initValues = () => ({
        phoneNumber: user.phoneNumber ?? "",
        currentCompany: user.mentor?.currentCompany ?? "",
        fieldOfWork: user.mentor?.fieldOfWork ?? "",
        biography: user.mentor?.biography ?? "",
        avatarUrl: user.avatarUrl ?? "",
        yearsOfExperience: String(user.mentor?.yearsOfExperience) ?? "",
    });

    let editableValues = $state(initValues());

    $effect(() => { Object.assign(editableValues, initValues()); });
    $effect(() => { editableValues.avatarUrl; avatarError = false; });
    $effect(() => { if (form?.errors && Object.keys(form.errors).length > 0) isEditing = true; });

    // ─── Info list ────────────────────────────────────────────
    let mentorInformations = $derived([
        { label: "Full Name",         value: user.fullName,                  icon: UserIcon,      editable: false, key: null,               multiline: false },
        { label: "Mentor Code",       value: user.mentor?.mentorCode,       icon: IdCardIcon,    editable: false, key: null,               multiline: false },
        { label: "Phone Number",      value: user.phoneNumber,               icon: PhoneIcon,     editable: true,  key: "phoneNumber"    as keyof typeof editableValues, multiline: false },
        { label: "Company",           value: user.mentor?.currentCompany,   icon: BriefcaseIcon, editable: true,  key: "currentCompany" as keyof typeof editableValues, multiline: false },
        { label: "Field of Work",     value: user.mentor?.fieldOfWork,      icon: WrenchIcon,    editable: true,  key: "fieldOfWork"    as keyof typeof editableValues, multiline: false },
        { label: "Years of Experience", value: String(user.mentor?.yearsOfExperience ?? ""), icon: ClockIcon, editable: true, key: "yearsOfExperience" as keyof typeof editableValues, multiline: false },
        { label: "Biography",         value: user.mentor?.biography,        icon: FileTextIcon,  editable: true,  key: "biography"      as keyof typeof editableValues, multiline: true  },
    ]);

    const displayValue = (o: (typeof mentorInformations)[number]): string => {
        if (!o.key) return o.value ?? "";
        return editableValues[o.key];
    };

    // ─── Handlers ────────────────────────────────────────────
    const handleAvatarChange = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        isUploadingAvatar = true;
        const toastId = toast.loading("Uploading avatar...");
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("?/UploadAvatar", {
            method: "POST",
            body: fd,
            headers: { "x-sveltekit-action": "true" },
        });

        const result = deserialize(await res.text()) as any;
        const uploadedUrl = result?.data?.result?.data;

        if (result?.type === "success" && uploadedUrl) {
            editableValues.avatarUrl = uploadedUrl;
            toast.success("Avatar uploaded successfully!", { id: toastId });
        } else {
            toast.error(result?.data?.message ?? "Failed to upload avatar.", { id: toastId });
        }

        isUploadingAvatar = false;
        input.value = "";
    };

    const handleCancelClick = () => {
        setActions({
            active: true,
            description: "All unsaved changes will be lost. Are you sure you want to cancel?",
            cb: async () => {
                Object.assign(editableValues, initValues());
                isEditing = false;
            },
        });
    };

    const handleSubmit = () => {
        isSubmitting = true;
        return async ({ result, update }: any) => {
            isSubmitting = false;
            if (result.type === "failure") {
                await update({ reset: false });
                if (result.data?.error) toast.error(result.data.error);
            } else if (result.type === "success") {
                await invalidate("profile:user");
                isEditing = false;
                toast.success("Profile updated successfully!");
            } else {
                await update();
            }
        };
    };
</script>

{#snippet mentorInfoCard(o: (typeof mentorInformations)[number])}
    {@const Icon = o.icon}
    <div class="flex flex-col gap-3" class:col-span-full={o.multiline}>
        <div class="flex gap-3 w-full">
            <div class="mt-1">
                <Icon class="w-5 h-5 text-logo shrink-0" />
            </div>
            <div class="w-full">
                <h5 class="text-[13px] font-semibold text-stone-500 mb-1">{o.label}</h5>

                {#if isEditing && o.editable && o.key}
                    {#if o.multiline}
                        <textarea
                            name={o.key}
                            disabled={isSubmitting}
                            rows={4}
                            bind:value={editableValues[o.key]}
                            class="flex w-full rounded-md border border-amber-400 bg-transparent px-3 py-2 text-[15px] font-bold text-stone-800 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        ></textarea>
                    {:else}
                        <Input
                            name={o.key}
                            disabled={isSubmitting}
                            class="text-[15px] text-stone-800 font-bold border-amber-400 focus-visible:ring-amber-400"
                            bind:value={editableValues[o.key]}
                        />
                    {/if}

                    {#if form?.errors?.[o.key]}
                        <p class="text-red-500 text-xs mt-1">{form.errors[o.key]}</p>
                    {/if}

                {:else}
                    {#if o.multiline}
                        <div class="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-[15px] font-bold text-stone-800 min-h-[80px] whitespace-pre-wrap">
                            {displayValue(o) || "—"}
                        </div>
                    {:else}
                        <Input
                            disabled={true}
                            class="text-[15px] text-stone-800 font-bold"
                            value={displayValue(o) || "—"}
                        />
                    {/if}
                {/if}
            </div>
        </div>
        <Separator class="bg-stone-200" />
    </div>
{/snippet}

<div class="w-full bg-stone-50 pt-5 px-10 overflow-hidden">
    <div class="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" class="cursor-pointer" onclick={() => history.back()}>
            <ArrowLeftIcon class="w-5 h-5" />
        </Button>
        <h1 class="text-2xl font-bold text-stone-800">My Profile</h1>
    </div>

    <div class="w-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <!-- Avatar -->
        <div class="flex flex-col items-center gap-2 py-8 px-6 border-b border-stone-100 bg-gradient-to-b from-amber-50 to-white">
            <div class="relative">
                {#if editableValues.avatarUrl && !avatarError}
                    <img
                        class="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
                        src={editableValues.avatarUrl}
                        alt="avatar"
                        onerror={() => (avatarError = true)}
                    />
                {:else}
                    <div class="w-24 h-24 rounded-full ring-4 ring-white shadow-md bg-amber-100 flex items-center justify-center">
                        <span class="text-2xl font-bold text-amber-600 select-none">
                            {getInitials(user.fullName ?? "?")}
                        </span>
                    </div>
                {/if}
                {#if isUploadingAvatar}
                    <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                        <Loader2Icon class="w-6 h-6 text-white animate-spin" />
                    </div>
                {/if}
            </div>

            <h2 class="text-xl font-bold text-stone-800">{user.fullName}</h2>
            <p class="text-sm text-stone-500">Mentor</p>

            <input id="avatar-upload" type="file" accept="image/*" class="hidden" onchange={handleAvatarChange} />
            {#if isEditing}
                <Button
                    type="button"
                    variant="outline"
                    class="mt-2 cursor-pointer gap-2 text-sm"
                    disabled={isUploadingAvatar}
                    onclick={() => document.getElementById("avatar-upload")?.click()}
                >
                    {#if isUploadingAvatar}
                        <Loader2Icon class="w-4 h-4 animate-spin" /> Uploading...
                    {:else}
                        <CameraIcon class="w-4 h-4" /> Change Avatar
                    {/if}
                </Button>
            {/if}
        </div>

        <!-- Form -->
        <form method="POST" action="?/updateProfile" use:enhance={handleSubmit}>
            <input type="hidden" name="avatarUrl" value={editableValues.avatarUrl} />

            <div class="p-6">
                <h3 class="text-base font-semibold text-stone-700 mb-5">Personal Information</h3>
                <!-- Biography chiếm full width, các field còn lại 3 cột -->
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-4">
                    {#each mentorInformations as cardInfo}
                        {@render mentorInfoCard(cardInfo)}
                    {/each}
                </div>
            </div>

            <div class="flex justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
                {#if isEditing}
                    <Button type="button" variant="outline" class="cursor-pointer" onclick={handleCancelClick} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} class="bg-logo cursor-pointer min-w-32">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                {:else}
                    <Button type="button" onclick={() => (isEditing = true)} class="bg-logo cursor-pointer min-w-40">
                        Update Information
                    </Button>
                {/if}
            </div>
        </form>
    </div>
</div>