<script lang="ts">
    import { enhance } from "$app/forms";
    import { Badge } from "$lib/components/ui/badge";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {
        UserCircleIcon, MailIcon, PhoneIcon, SchoolIcon,
        BookOpenIcon, UsersIcon, CalendarIcon, HashIcon, Loader2Icon,
    } from "lucide-svelte";
    import type { SubmitFunction } from "@sveltejs/kit";

    let {
        open = $bindable(false),
        studentId = null,
        currentUserId = null,
    }: {
        open: boolean;
        studentId: number | null;
        currentUserId?: number | null;
    } = $props();

    type StudentDetail = {
        studentId: number;
        studentCode: string;
        fullName: string;
        email: string;
        gender: string;
        dateOfBirth: string | null;
        phoneNumber: string | null;
        campusName: string;
        majorName: string;
        className: string;
        enrollmentYear: number | null;
        currentSemester: number | null;
    };

    let student = $state<StudentDetail | null>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    let getStudentForm = $state<HTMLFormElement | null>(null);
    let studentIdInput = $state<HTMLInputElement | null>(null);

    // Khi open=true và studentId có giá trị → fetch
    $effect(() => {
        if (open && studentId !== null) {
            student = null;
            error = null;
            if (studentIdInput) studentIdInput.value = String(studentId);
            import("svelte").then(({ tick }) =>
                tick().then(() => getStudentForm?.requestSubmit())
            );
        }
        if (!open) {
            student = null;
            error = null;
        }
    });

    const handleGetStudent: SubmitFunction = () => {
        isLoading = true;
        error = null;
        student = null;
        return async ({ result }) => {
            if (result.type === "success") {
                student = (result?.data as any)?.student ?? null;
                if (!student) error = "Could not load student information.";
            } else {
                error = "Could not load student information.";
            }
            isLoading = false;
        };
    };

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "—";
        return new Intl.DateTimeFormat("en-US", {
            month: "long", day: "numeric", year: "numeric",
        }).format(new Date(dateStr));
    }

    const genderColor: Record<string, string> = {
        Male: "bg-blue-50 text-blue-700 border-blue-200",
        Female: "bg-pink-50 text-pink-700 border-pink-200",
    };
</script>

<!-- Hidden form -->
<form
    method="POST"
    action="?/getStudentDetail"
    use:enhance={handleGetStudent}
    bind:this={getStudentForm}
>
    <input type="hidden" name="studentId" bind:this={studentIdInput} />
</form>

<Dialog.Root bind:open={open}>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2 text-base font-bold text-stone-900">
                <UserCircleIcon class="w-4 h-4 text-amber-500" />
                Student Detail
            </Dialog.Title>
        </Dialog.Header>

        <div class="py-2 min-h-[220px] flex flex-col">
            <!-- Loading -->
            {#if isLoading}
                <div class="flex flex-1 items-center justify-center py-12 gap-3 text-stone-300">
                    <Loader2Icon class="w-6 h-6 animate-spin text-amber-400" />
                    <p class="text-xs text-stone-400">Loading...</p>
                </div>

            <!-- Error -->
            {:else if error}
                <div class="flex flex-1 items-center justify-center py-12">
                    <p class="text-sm text-red-400 font-medium">{error}</p>
                </div>

            <!-- Content -->
            {:else if student}
                <div class="flex flex-col gap-5">
                    <!-- Avatar + Name -->
                    <div class="flex items-center gap-4">
                        <div class="h-14 w-14 shrink-0 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700">
                            {student.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <p class="text-base font-bold text-stone-900">
                                    {student.fullName}
                                </p>
                                {#if student.studentId === currentUserId}
                                    <span class="text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
                                        You
                                    </span>
                                {/if}
                            </div>
                            <p class="font-mono text-sm text-stone-400 mt-0.5">
                                {student.studentCode}
                            </p>
                            <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {#if student.gender}
                                    <Badge class="text-xs border font-medium {genderColor[student.gender] ?? 'bg-stone-100 text-stone-500 border-stone-200'}">
                                        {student.gender}
                                    </Badge>
                                {/if}
                                {#if student.currentSemester}
                                    <Badge class="text-xs border font-medium bg-violet-50 text-violet-700 border-violet-200">
                                        Semester {student.currentSemester}
                                    </Badge>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-stone-100"></div>

                    <!-- Info list -->
                    <div class="rounded-xl border border-stone-100 bg-stone-50/60 divide-y divide-stone-100">
                        {#each [
                            { icon: MailIcon,     label: "Email",            value: student.email },
                            { icon: SchoolIcon,   label: "Campus",           value: student.campusName },
                            { icon: BookOpenIcon, label: "Major",            value: student.majorName },
                            { icon: UsersIcon,    label: "Class",            value: student.className },
                            { icon: CalendarIcon, label: "Date of Birth",    value: formatDate(student.dateOfBirth) },
                        ].filter(f => f.value && f.value !== "—") as field}
                            <div class="flex items-start gap-3 px-4 py-3">
                                <svelte:component
                                    this={field.icon}
                                    class="w-4 h-4 text-stone-400 mt-0.5 shrink-0"
                                />
                                <div>
                                    <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none mb-0.5">
                                        {field.label}
                                    </p>
                                    <p class="text-sm font-semibold text-stone-900 break-all">
                                        {field.value}
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>