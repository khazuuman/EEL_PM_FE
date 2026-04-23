<script lang="ts">
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import {
        User, Mail, GraduationCap, Building,
        Laptop, RefreshCw, IdCard, VenusAndMars, ArrowLeft,
    } from "lucide-svelte";

    let { data } = $props();
    let student = data.student;

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };
</script>

<div class="w-full bg-white flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex-none px-6 pt-4 pb-3 border-b border-slate-100">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2 cursor-pointer"
        >
            <ArrowLeft class="w-4 h-4" />
            <span class="text-sm font-semibold">Back</span>
        </Button>
    </div>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden">

        <!-- LEFT: Avatar + Name -->
        <div class="w-72 flex-none flex flex-col items-center justify-center gap-5 px-8 border-r border-slate-100 bg-slate-50/50">
            <Avatar class="h-32 w-32 ring-4 ring-offset-2 ring-orange-500 ring-offset-white shadow-md">
                <AvatarFallback class="text-4xl font-bold text-slate-400 bg-slate-100">
                    {getInitials(student.fullName)}
                </AvatarFallback>
            </Avatar>

            <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-2xl font-black text-slate-900 leading-tight">
                    {student.fullName}
                </h1>
                <Badge class="bg-orange-500 text-white border-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold">
                    <IdCard class="w-3.5 h-3.5" />
                    {student.studentCode}
                </Badge>
            </div>

            <div class="w-12 h-0.5 bg-orange-500 rounded-full"></div>

            <div class="flex flex-col items-center gap-1.5 text-center">
                <p class="text-slate-700 font-semibold text-base">{student.majorName}</p>
                <p class="text-slate-400 text-sm flex items-center gap-1.5">
                    <Building class="w-4 h-4" />
                    {student.campusName}
                </p>
            </div>
        </div>

        <!-- RIGHT: Info Grid -->
        <div class="flex-1 overflow-hidden px-10 py-8 flex flex-col gap-8">

            <!-- Personal -->
            <div>
                <div class="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                    <User class="w-6 h-6 text-orange-500" />
                    <h2 class="text-lg font-bold text-slate-800">Personal Information</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <Mail class="w-6 h-6 text-slate-400 flex-none" />
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
                            <p class="text-base font-semibold text-slate-800">{student.email}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <VenusAndMars class="w-6 h-6 text-slate-400 flex-none" />
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">Gender</p>
                            <p class="text-base font-semibold {student.gender ? 'text-slate-800' : 'text-slate-400 italic'}">
                                {student.gender ?? "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Academic -->
            <div>
                <div class="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                    <GraduationCap class="w-6 h-6 text-orange-500" />
                    <h2 class="text-lg font-bold text-slate-800">Academic Information</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div class="p-2.5 bg-orange-50 rounded-lg flex-none">
                            <Building class="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">Campus</p>
                            <p class="text-base font-bold text-slate-800">{student.campusName}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div class="p-2.5 bg-slate-100 rounded-lg flex-none">
                            <Laptop class="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">Major</p>
                            <p class="text-base font-bold text-slate-800">{student.majorName}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                        <div class="p-2.5 bg-slate-100 rounded-lg flex-none">
                            <RefreshCw class="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-400 uppercase tracking-wide mb-0.5">Class</p>
                            <p class="text-base font-bold text-slate-800">{student.className}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>