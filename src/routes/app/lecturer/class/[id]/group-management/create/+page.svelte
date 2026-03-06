<script lang="ts">
    import Button, {
        buttonVariants,
    } from "$lib/components/ui/button/button.svelte";
    import FieldLabel from "$lib/components/ui/field/field-label.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import { PlusIcon, UserPlusIcon, XIcon } from "lucide-svelte";
    import { UserIcon } from "phosphor-svelte";
    import type { PageData } from "../$types";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";

    let { data, form } = $props<{ data: PageData; form: any }>();
    const students = $derived(data.students as any[]);
    let addedStudents = $state([] as any[]); // chỉ update khi Save
    let dialogOpen = $state(false);
    let selectedIds = $state(new Set<any>());

    function toggleStudent(id: any, checked: boolean) {
        if (checked) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
        // trigger reactivity
        selectedIds = new Set(selectedIds);
        console.log("toggleStudent", selectedIds);
    }

    function saveStudents() {
        addedStudents = students.filter((s) => selectedIds.has(s.studentId));
        dialogOpen = false;
    }

    function removeStudent(id: any) {
        addedStudents = addedStudents.filter((s) => s.studentId !== id);
        selectedIds.delete(id);
        selectedIds = new Set(selectedIds);
    }

    $effect(() => {
        if (form?.message) {
            // show toast lỗi validation
            toast.error(form.message);
        }
        if (form?.error) {
            // show toast lỗi từ API
            toast.error(form.error);
        }
        if (form?.success) {
            toast.success("Group created successfully!");
            goto(`/app/lecturer/class/${data.classId}/group-management`);
        }
    });
</script>

<div class="bg-white w-full h-full px-20 py-10">
    <h1 class="text-3xl font-extrabold mb-10">Create New Group</h1>
    <div class="flex gap-10">
        <div class="w-[50%]">
            <form
                use:enhance
                id="createGroupForm"
                class="w-full h-full"
                method="POST"
                action="?/createGroup"
            >
                <FieldLabel for="groupName" class="text-stone-500 mb-3"
                    >GROUP NAME</FieldLabel
                >
                <Input
                    id="groupName"
                    name="name"
                    type="text"
                    placeholder="m@example.com"
                    required
                />
                <FieldLabel class="text-stone-500 mb-3 mt-5" for="description"
                    >DESCRIPTION</FieldLabel
                >
                <Textarea
                    name="description"
                    id="description"
                    placeholder="Type your description here."
                />
                {#each addedStudents as student}
                    <input
                        type="hidden"
                        name="studentIds"
                        value={student.studentId}
                    />
                {/each}
                <input type="hidden" name="classId" value={data?.classId} />
            </form>
        </div>
        <div class="w-[50%]">
            <FieldLabel class="text-stone-500 mb-3" for="students"
                >STUDENTS</FieldLabel
            >
            <Dialog.Root bind:open={dialogOpen}>
                <!-- <form class="w-full"> -->
                <Dialog.Trigger class="w-full flex justify-center">
                    <Button
                        type="button"
                        class="w-[30%] bg-amber-500 cursor-pointer mb-5"
                        ><UserPlusIcon />Add</Button
                    >
                </Dialog.Trigger>
                <Dialog.Content class="sm:max-w-[425px]">
                    <Dialog.Header>
                        <Dialog.Title>Students Available</Dialog.Title>
                        <Dialog.Description>
                            Add students who are not yet in a group.
                        </Dialog.Description>
                    </Dialog.Header>
                    <div class="flex flex-col gap-2">
                        {#each students as student}
                            <label
                                class="flex items-center justify-between px-3 py-2 rounded-md border border-stone-200 hover:bg-amber-50 cursor-pointer has-[:checked]:bg-amber-50 has-[:checked]:border-amber-400 transition-colors"
                            >
                                <div class="flex flex-col">
                                    <span
                                        class="font-medium text-stone-800 text-[14px]"
                                    >
                                        {student.name}
                                        <span
                                            class="text-stone-500 text-[13px] font-normal ml-1"
                                        >
                                            {student.studentCode}
                                        </span>
                                    </span>
                                    <span class="text-stone-500 text-[13px]">
                                        {student.major}
                                    </span>
                                </div>
                                <Checkbox
                                    checked={selectedIds.has(student.studentId)}
                                    onCheckedChange={(v: any) =>
                                        toggleStudent(student.studentId, v)}
                                    class="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                />
                            </label>
                        {/each}
                    </div>

                    <Dialog.Footer>
                        <Dialog.Close
                            type="button"
                            class={buttonVariants({
                                variant: "outline",
                            })}
                            onclick={() => (dialogOpen = false)}
                        >
                            Cancel
                        </Dialog.Close>
                        <Button onclick={saveStudents} type="submit"
                            >Save changes</Button
                        >
                    </Dialog.Footer>
                </Dialog.Content>
                <!-- </form> -->
            </Dialog.Root>

            <!-- Student list -->
            <div
                class="border-2 border-stone-300 rounded-sm p-5 flex flex-wrap gap-2 min-h-15"
            >
                {#if addedStudents.length === 0}
                    <span class="text-stone-400 text-sm w-full text-center"
                        >No students added</span
                    >
                {:else}
                    {#each addedStudents as student}
                        <span
                            class="flex gap-2 justify-center items-center w-fit px-2 py-1 bg-amber-100 rounded-md text-[14px] text-stone-600"
                        >
                            <UserIcon weight="fill" class="text-amber-500" />
                            {student.name} - {student.studentCode}
                            <Button
                                class="w-5 h-5 bg-amber-100 hover:[&_svg]:text-white cursor-pointer"
                                onclick={() => removeStudent(student.studentId)}
                            >
                                <XIcon class="text-black" />
                            </Button>
                        </span>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
    <div class="mt-15 flex gap-5 w-full justify-center">
        <Button
            onclick={() =>
                goto(`/app/lecturer/class/${data?.classId}/group-management`)}
            class="cursor-pointer"
            variant="outline">Cancel</Button
        >
        <Button
            type="submit"
            form="createGroupForm"
            class="bg-amber-500 cursor-pointer"><PlusIcon />Create Group</Button
        >
    </div>
</div>
