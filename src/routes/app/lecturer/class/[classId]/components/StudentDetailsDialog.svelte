<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import Button from "$lib/components/ui/button/button.svelte";
    import { Separator } from "$lib/components/ui/separator";
    import {
        UserIcon,
        MailIcon,
        BookOpenIcon,
        GraduationCapIcon,
        PhoneIcon,
    } from "lucide-svelte";

    type StudentDetail = {
        fullName?: string;
        studentCode?: string;
        gender?: string;
        email?: string;
        className?: string;
        majorName?: string;
        // phoneNumber?: string;
        // campusName?: string;
        // enrollmentYear?: string | number;
    };

    let {
        open = $bindable(false),
        student = null,
    }: {
        open: boolean;
        student: StudentDetail | null;
    } = $props();
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-lg bg-white p-0 overflow-hidden rounded-2xl shadow-lg border-gray-200">
        <!-- Header -->
        <div class="bg-gray-50/60 border-b border-gray-100 px-6 py-4 flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <UserIcon class="h-6 w-6" />
            </div>
            <div>
                <Dialog.Title class="text-xl font-bold text-gray-900 tracking-tight">
                    Student Details
                </Dialog.Title>
                <Dialog.Description class="text-xs text-gray-500 mt-0.5">
                    Comprehensive profile information.
                </Dialog.Description>
            </div>
        </div>

        {#if student}
            <div class="px-6 py-6 space-y-6">
                <!-- Avatar & Name -->
                <div class="flex items-center gap-5">
                    <div class="h-16 w-16 shrink-0 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-100 text-amber-700 font-extrabold text-2xl shadow-sm">
                        {student.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div>
                        <h3 class="text-2xl font-extrabold text-gray-900 leading-tight">
                            {student.fullName}
                        </h3>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                {student.studentCode}
                            </span>
                            {#if student.gender}
                                <span class="text-xs text-gray-400">•</span>
                                <span class="text-sm text-gray-500">{student.gender}</span>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 hover:bg-gray-50 hover:border-gray-200 transition-colors">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <MailIcon class="h-3 w-3" /> Email
                        </p>
                        <p class="text-sm font-semibold text-gray-900 break-all">
                            {student.email ?? "—"}
                        </p>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 hover:bg-gray-50 hover:border-gray-200 transition-colors">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <BookOpenIcon class="h-3 w-3" /> Class
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {student.className ?? "—"}
                        </p>
                    </div>

                    <div class="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4 hover:bg-gray-50 hover:border-gray-200 transition-colors">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <GraduationCapIcon class="h-3 w-3" /> Major
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {student.majorName ?? "—"}
                        </p>
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex justify-end">
                <Button
                    variant="outline"
                    class="bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer shadow-sm px-6 font-semibold"
                    onclick={() => (open = false)}
                >
                    Close
                </Button>
            </div>
        {:else}
            <div class="p-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500"></div>
                <p class="text-sm font-medium">Fetching details...</p>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>