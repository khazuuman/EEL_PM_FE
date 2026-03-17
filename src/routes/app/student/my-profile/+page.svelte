<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import {
        CakeIcon,
        CalendarIcon,
        CameraIcon,
        GraduationCapIcon,
        IdCardIcon,
        PhoneIcon,
        UserIcon,
        VenusAndMarsIcon,
    } from "lucide-svelte";
    import type { ActionData, PageData } from "./$types";
    import type { UserProfileDto } from "$lib/types/user";
    import Input from "$lib/components/ui/input/input.svelte";
    import { formatIfDate } from "$lib/utils/date-format";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import { invalidate } from "$app/navigation";

    let { data, form } = $props<{ data: PageData; form: ActionData }>();
    let user = $derived(data.user as UserProfileDto);
    let isEditing = $state(false);
    let showCancelDialog = $state(false);
    let isSubmitting = $state(false);

    let studentInformations = $derived([
        {
            label: "Full Name",
            value: user.fullName,
            icon: UserIcon,
            editable: false,
            key: null,
        },
        {
            label: "Student Code",
            value: user.student?.studentCode,
            icon: IdCardIcon,
            editable: false,
            key: null,
        },
        {
            label: "Gender",
            value: user.student?.gender,
            icon: VenusAndMarsIcon,
            editable: true,
            key: "gender" as keyof typeof editableValues,
        },
        {
            label: "Phone Number",
            value: user.phoneNumber,
            icon: PhoneIcon,
            editable: true,
            key: "phoneNumber" as keyof typeof editableValues,
        },
        {
            label: "Current Semester",
            value: user.student?.currentSemester,
            icon: CalendarIcon,
            editable: false,
            key: null,
        },
        {
            label: "Major",
            value: user.student?.majorName,
            icon: GraduationCapIcon,
            editable: false,
            key: null,
        },
        {
            label: "Date Of Birth",
            value: formatIfDate(user.student?.dateOfBirth),
            icon: CakeIcon,
            editable: true,
            key: "dateOfBirth" as keyof typeof editableValues,
        },
    ]);

    let editableValues = $state({
        gender: user.student?.gender ?? "",
        phoneNumber: user.phoneNumber ?? "",
        dateOfBirth: user.student?.dateOfBirth ?? "",
    });

    $effect(() => {
        editableValues.gender = user.student?.gender ?? "";
        editableValues.phoneNumber = user.phoneNumber ?? "";
        editableValues.dateOfBirth = user.student?.dateOfBirth ?? "";
    });

    const confirmCancel = () => {
        // Reset về giá trị gốc
        editableValues.gender = user.student?.gender ?? "";
        editableValues.phoneNumber = user.phoneNumber ?? "";
        editableValues.dateOfBirth = user.student?.dateOfBirth ?? "";
        isEditing = false;
    };

    const handleSubmit = () => {
        isSubmitting = true;
        return async ({ result, update }: any) => {
            isSubmitting = false;

            if (result.type === "failure") {
                // Có lỗi validation hoặc server error → giữ isEditing = true
                await update({ reset: false });

                // Toast nếu có lỗi server (không phải validation)
                if (result.data?.error) {
                    toast.error(result.data.error);
                }
            } else if (result.type === "success") {
                await invalidate("profile:user"); // load lại data từ server
                isEditing = false;
                toast.success("Profile updated successfully!");
            } else {
                await update();
            }
        };
    };

    $effect(() => {
        // Chỉ giữ để hiển thị lại isEditing khi có lỗi validation (optional)
        if (form?.errors && Object.keys(form.errors).length > 0) {
            isEditing = true;
        }
    });
</script>

{#snippet studentInforCard(o: (typeof studentInformations)[number])}
    {@const Icon = o.icon}
    <div>
        <div class="flex gap-2 mb-4 w-full">
            <Icon class="w-5 h-5 text-logo" />
            <div class="w-full">
                <h5 class="text-[14px] font-semibold text-stone-500">
                    {o.label}
                </h5>
                {#if isEditing && o.editable && o.key}
                    <Input
                        name={o.key}
                        disabled={isSubmitting}
                        class="text-[15px] text-stone-800 font-bold w-full border-amber-400 focus-visible:ring-amber-400"
                        bind:value={editableValues[o.key]}
                    />
                    <!-- Hiển thị lỗi field tương ứng -->
                    {#if form?.errors?.[o.key]}
                        <p class="text-red-500 text-xs mt-1">
                            {form.errors[o.key]}
                        </p>
                    {/if}
                {:else}
                    <Input
                        disabled={true}
                        class="text-[15px] text-stone-800 font-bold w-full"
                        value={o.key ? editableValues[o.key] : o.value}
                    />
                {/if}
            </div>
        </div>
        <Separator class="h-1 bg-stone-300" />
    </div>
{/snippet}

<AlertDialog.Root bind:open={showCancelDialog}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel onclick={confirmCancel}
                >Cancel Changes</AlertDialog.Cancel
            >
            <AlertDialog.Action onclick={() => (showCancelDialog = false)}
                >Continue Edit</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<div class="w-screen flex justify-center items-center">
    <div class="w-[70%] pt-5">
        <h1
            class="text-3xl font-bold text-black bg-white w-fit px-3 rounded-t-md"
        >
            My Profile
        </h1>
        <div
            class="w-full flex flex-col items-center bg-white p-5 rounded-tr-md rounded-br-md rounded-bl-md overflow-hidden"
        >
            <div
                class="w-full flex flex-col justify-center items-center gap-2 mb-15"
            >
                <img
                    class="w-25 h-25 rounded-full object-cover"
                    src={user.avatarUrl ??
                        "https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"}
                    alt=""
                />
                <h5 class="text-xl text-stone-800 font-bold">
                    Student Information
                </h5>
                <p class="text-[14px] text-stone-600">
                    Update your personal information here
                </p>
                <Button class="bg-logo cursor-pointer mt-4"
                    ><CameraIcon />Change Avatar</Button
                >
            </div>
            <form
                method="POST"
                action="?/updateProfile"
                use:enhance={handleSubmit}
            >
                <div class="grid grid-cols-3 grid-rows-3 gap-5 w-full mb-10">
                    {#each studentInformations as cardInfo}
                        {@render studentInforCard(cardInfo)}
                    {/each}
                </div>
                <div class="flex w-full justify-center gap-3">
                    {#if isEditing}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            class="bg-logo cursor-pointer w-50"
                            >{#if isSubmitting}
                                Saving...
                            {:else}
                                Save Changes
                            {/if}</Button
                        >
                        <Button
                            onclick={() => (showCancelDialog = true)}
                            variant="outline"
                            class="cursor-pointer">Cancel</Button
                        >
                    {:else}
                        <Button
                            onclick={() => (isEditing = true)}
                            class="bg-logo cursor-pointer w-50"
                            >Update Information</Button
                        >
                    {/if}
                </div>
            </form>
        </div>
    </div>
</div>
