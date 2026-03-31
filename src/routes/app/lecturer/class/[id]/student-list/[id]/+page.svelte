<script lang="ts">
    import { Avatar, AvatarFallback } from "$lib/components/ui/avatar";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import {
        User,
        Mail,
        Phone,
        Calendar,
        GraduationCap,
        Building,
        Laptop,
        RefreshCw,
        CalendarDays,
        IdCard,
        VenusAndMars,
        ArrowLeft,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { data } = $props();
    let student = data.students;

    let classId = data.classId;

    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (
            parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    // const handleBack = () => {
    //     goto(`app/lecturer/class/${classId}/student-list`);
    // };
</script>

<!-- Giao diện full-screen với nền trắng hoàn toàn (bg-white) -->
<div class="min-h-screen w-full bg-white relative flex flex-col pt-20">
    <!-- Top Header: Back Button -->
    <div class="w-full pt-6 lg:pt-10 px-6 lg:px-12 xl:px-16 flex items-center">
        <Button
            variant="ghost"
            onclick={() => history.back()}
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-6 transition-all cursor-pointer"
        >
            <ArrowLeft class="w-5 h-5" />
            <span class="text-base font-semibold">Back to Class</span>
        </Button>
    </div>

    <!-- Main Content Area -->
    <div
        class="w-full px-6 lg:px-12 xl:px-16 pb-12 xl:pb-16 pt-8 flex flex-col xl:flex-row gap-12 xl:gap-20 flex-1"
    >
        <!-- CỘT TRÁI: Profile Summary -->
        <div
            class="w-full xl:w-[25%] xl:min-w-[320px] flex flex-col items-center xl:items-start text-center xl:text-left gap-6 xl:sticky xl:top-10 h-fit"
        >
            <Avatar
                class="h-40 w-40 xl:h-48 xl:w-48 ring-4 ring-offset-4 ring-orange-500 ring-offset-white shadow-xl"
            >
                <AvatarFallback
                    class="text-5xl font-bold text-slate-400 bg-slate-50"
                >
                    {getInitials(student.fullName)}
                </AvatarFallback>
            </Avatar>

            <div
                class="flex flex-col items-center xl:items-start gap-4 w-full mt-4"
            >
                <h1
                    class="text-4xl xl:text-5xl font-black tracking-tight text-slate-900 leading-tight"
                >
                    {student.fullName}
                </h1>

                <Badge
                    class="bg-orange-500 text-white hover:bg-orange-600 border-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-md w-fit"
                >
                    <IdCard class="w-4 h-4" />
                    {student.studentCode}
                </Badge>

                <div
                    class="w-16 h-1 bg-orange-500 rounded-full my-4 xl:my-6"
                ></div>

                <p class="text-slate-600 font-semibold text-lg xl:text-xl">
                    {student.majorName}
                </p>
                <p class="text-slate-500 text-base flex items-center gap-2">
                    <Building class="w-5 h-5" />
                    {student.campusName}
                </p>
            </div>
        </div>

        <!-- CỘT PHẢI: Detailed Information -->
        <div
            class="w-full xl:w-[75%] grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16"
        >
            <!-- Personal Information Column -->
            <div class="flex flex-col gap-8 w-full">
                <div
                    class="flex items-center gap-3 pb-4 border-b-2 border-slate-100"
                >
                    <User class="w-8 h-8 text-orange-500" />
                    <h2 class="text-2xl font-bold text-slate-900">
                        Personal Information
                    </h2>
                </div>

                <div class="flex flex-col gap-10">
                    <div class="group">
                        <p
                            class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"
                        >
                            Email Address
                        </p>
                        <div
                            class="flex items-center gap-4 text-lg xl:text-xl font-medium text-slate-800 transition-transform group-hover:translate-x-2 duration-300"
                        >
                            <Mail class="w-6 h-6 text-slate-300" />
                            {student.email}
                        </div>
                    </div>

                    <div class="group">
                        <p
                            class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"
                        >
                            Gender
                        </p>
                        <div
                            class="flex items-center gap-4 text-lg xl:text-xl text-slate-400 font-medium {student.gender
                                ? 'text-slate-800 not-italic'
                                : 'italic'} transition-transform group-hover:translate-x-2 duration-300"
                        >
                            <VenusAndMars class="w-6 h-6 text-slate-300" />
                            {student.gender ?? "Not provided"}
                        </div>
                    </div>

                    <div class="group">
                        <p
                            class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"
                        >
                            Date of Birth
                        </p>
                        <div
                            class="flex items-center gap-4 text-lg xl:text-xl text-slate-400 font-medium {student.dateOfBirth
                                ? 'text-slate-800 not-italic'
                                : 'italic'} transition-transform group-hover:translate-x-2 duration-300"
                        >
                            <Calendar class="w-6 h-6 text-slate-300" />
                            {student.dateOfBirth ?? "Not provided"}
                        </div>
                    </div>

                    <div class="group">
                        <p
                            class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3"
                        >
                            Phone Number
                        </p>
                        <div
                            class="flex items-center gap-4 text-lg xl:text-xl text-slate-400 font-medium {student.phoneNumber
                                ? 'text-slate-800 not-italic'
                                : 'italic'} transition-transform group-hover:translate-x-2 duration-300"
                        >
                            <Phone class="w-6 h-6 text-slate-300" />
                            {student.phoneNumber ?? "Not provided"}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Academic Information Column -->
            <div class="flex flex-col gap-8 w-full">
                <div
                    class="flex items-center justify-between pb-4 border-b-2 border-slate-100"
                >
                    <div class="flex items-center gap-3">
                        <GraduationCap class="w-8 h-8 text-orange-500" />
                        <h2 class="text-2xl font-bold text-slate-900">
                            Academic Information
                        </h2>
                    </div>
                </div>

                <div class="flex flex-col gap-8">
                    <div class="flex items-start gap-5 group">
                        <div
                            class="p-4 bg-orange-50 rounded-2xl transition-colors group-hover:bg-orange-100"
                        >
                            <Building class="w-7 h-7 text-orange-500" />
                        </div>
                        <div class="pt-1">
                            <p
                                class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                            >
                                Campus
                            </p>
                            <p
                                class="text-lg xl:text-xl font-bold text-slate-800"
                            >
                                {student.campusName}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-5 group">
                        <div
                            class="p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-slate-100"
                        >
                            <Laptop class="w-7 h-7 text-slate-600" />
                        </div>
                        <div class="pt-1">
                            <p
                                class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                            >
                                Major
                            </p>
                            <p
                                class="text-lg xl:text-xl font-bold text-slate-800"
                            >
                                {student.majorName}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-5 group">
                        <div
                            class="p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-slate-100"
                        >
                            <RefreshCw class="w-7 h-7 text-slate-600" />
                        </div>
                        <div class="pt-1">
                            <p
                                class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                            >
                                Class
                            </p>
                            <p
                                class="text-lg xl:text-xl font-bold text-slate-800"
                            >
                                {student.className}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-5 group">
                        <div
                            class="p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-slate-100"
                        >
                            <CalendarDays class="w-7 h-7 text-slate-600" />
                        </div>
                        <div class="pt-1">
                            <p
                                class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                            >
                                Enrollment Year
                            </p>
                            <p
                                class="text-lg xl:text-xl font-bold text-slate-800"
                            >
                                {student.enrollmentYear}
                            </p>
                        </div>
                    </div>

                    <a
                        href="#transcript"
                        class="text-base font-bold text-orange-500 hover:text-orange-600 hover:underline transition-all block sm:hidden mt-4"
                    >
                        View Transcript
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
