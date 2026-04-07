<script lang="ts">
    import {
        BuildingIcon,
        CalendarIcon,
        ChevronLeftIcon,
        ChevronRightIcon,
        CodeIcon,
        BriefcaseIcon,
        MailIcon,
        StarIcon,
        VideoIcon,
        ListIcon,
        ClockIcon,
        CalendarDaysIcon,
        ShieldCheckIcon,
        ArrowLeftIcon,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { goto } from "$app/navigation";

    // Data từ load function
    let { data } = $props();
    // Chú ý: bạn trả về 'group' trong load function thay vì 'mentor'
    const mentor = $derived(data.group);

    // Fallback initials cho avatar
    const getInitials = (name: string) => {
        if (!name) return "M";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    // Mock data cho schedule (vì server chưa trả về)
    const upcomingMeetings = [
        {
            date: "AUG 06",
            title: "Sprint Review - Group 5",
            time: "10:00 AM - 11:30 AM",
            type: "Meet",
            status: "Scheduled",
            statusColor: "text-amber-600 bg-amber-100",
            borderColor: "border-l-amber-500",
        },
        {
            date: "AUG 08",
            title: "Code Architecture Review",
            time: "02:00 PM - 03:00 PM",
            type: "Meet",
            status: "Scheduled",
            statusColor: "text-amber-600 bg-amber-100",
            borderColor: "border-l-amber-500",
        },
        {
            date: "AUG 02",
            title: "Project Kickoff",
            time: "09:00 AM - 10:00 AM",
            type: "Meet",
            status: "Completed",
            statusColor: "text-emerald-600 bg-emerald-100",
            borderColor: "border-l-emerald-500",
        },
    ];

    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const dates = [4, 5, 6, 7, 8, 9, 10];
</script>

<div class="min-h-screen bg-stone-50/50 p-6 mx-auto">
    <div class="mx-auto px-4 sm:px-6 mb-2">
        <div class="flex items-center h-12">
            <Button
                variant="ghost"
                onclick={() => goto(`/app`)}
                class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
            >
                <ArrowLeftIcon class="w-4 h-4" />
                Back to Home
            </Button>
        </div>
    </div>
    {#if !mentor}
        <!-- Trạng thái chưa có mentor -->
        <div
            class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        >
            <div
                class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6"
            >
                <ShieldCheckIcon class="w-10 h-10 text-stone-300" />
            </div>
            <h2 class="text-2xl font-bold text-stone-800 mb-2">
                No Mentor Assigned Yet
            </h2>
            <p class="text-stone-500 max-w-md">
                Your group hasn't been assigned a mentor yet. Please contact the
                lecturer or wait for the lecturer to assign one.
            </p>
        </div>
    {:else}
        <!-- 1. MENTOR PROFILE CARD -->
        <Card.Root
            class="border-stone-100 shadow-sm bg-white overflow-hidden rounded-2xl"
        >
            <Card.Content class="p-5">
                <div class="flex flex-col lg:flex-row gap-8 justify-between">
                    <!-- Left: Avatar & Basic Info -->
                    <div class="flex gap-6 items-center lg:w-1/3">
                        <div
                            class="w-24 h-24 rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm shadow-amber-500/20"
                        >
                            {getInitials(mentor.fullName)}
                        </div>
                        <div class="space-y-2">
                            <h2
                                class="text-2xl font-extrabold text-stone-900 tracking-tight"
                            >
                                {mentor.fullName}
                            </h2>
                            <div class="flex items-center gap-3">
                                <Badge
                                    variant="secondary"
                                    class="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200/50 font-semibold px-2.5"
                                >
                                    <ShieldCheckIcon class="w-3 h-3 mr-1" />
                                    {mentor.mentorCode}
                                </Badge>
                            </div>
                            <div
                                class="flex items-center text-sm text-stone-500 gap-1.5 pt-1"
                            >
                                <MailIcon class="w-4 h-4" />
                                <span>{mentor.email}</span>
                            </div>
                            {#if mentor.phoneNumber}
                                <div
                                    class="flex items-center text-sm text-stone-500 gap-1.5"
                                >
                                    <span
                                        class="w-4 h-4 text-center font-bold text-xs"
                                        >☎</span
                                    >
                                    <span>{mentor.phoneNumber}</span>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <Separator
                        orientation="vertical"
                        class="hidden lg:block h-auto bg-stone-100"
                    />

                    <!-- Center: Professional Info Grid -->
                    <div class="grid grid-cols-2 gap-x-12 gap-y-6 lg:w-1/3">
                        <div class="space-y-1.5">
                            <p
                                class="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <BuildingIcon class="w-3.5 h-3.5" /> Company
                            </p>
                            <p class="font-semibold text-stone-800 text-sm">
                                {mentor.currentCompany || "N/A"}
                            </p>
                        </div>

                        <div class="space-y-1.5">
                            <p
                                class="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <BriefcaseIcon class="w-3.5 h-3.5" /> Position
                            </p>
                            <p class="font-semibold text-stone-800 text-sm">
                                {mentor.currentPosition || "N/A"}
                            </p>
                        </div>

                        <div class="space-y-1.5">
                            <p
                                class="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <CodeIcon class="w-3.5 h-3.5" /> Field
                            </p>
                            <p class="font-semibold text-stone-800 text-sm">
                                {mentor.fieldOfWork || "N/A"}
                            </p>
                        </div>

                        <div class="space-y-1.5">
                            <p
                                class="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5"
                            >
                                <StarIcon class="w-3.5 h-3.5" /> Experience
                            </p>
                            <p class="font-semibold text-stone-800 text-sm">
                                {mentor.yearsOfExperience
                                    ? `${mentor.yearsOfExperience} years`
                                    : "N/A"}
                            </p>
                        </div>
                    </div>

                    <Separator
                        orientation="vertical"
                        class="hidden lg:block h-auto bg-stone-100"
                    />

                    <!-- Right: Stats & CTA -->
                    <div class="flex flex-col justify-between lg:w-1/4 gap-4">
                        <div class="flex gap-3">
                            <div
                                class="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center"
                            >
                                <p class="text-2xl font-black text-amber-600">
                                    12
                                </p>
                                <p
                                    class="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mt-0.5"
                                >
                                    Total Meetings
                                </p>
                            </div>
                            <div
                                class="flex-1 bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center"
                            >
                                <p class="text-2xl font-black text-amber-600">
                                    3
                                </p>
                                <p
                                    class="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mt-0.5"
                                >
                                    Upcoming
                                </p>
                            </div>
                        </div>
                        <Button
                            class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm h-11 rounded-xl"
                        >
                            <CalendarDaysIcon class="w-4 h-4 mr-2" />
                            Schedule Meeting
                        </Button>
                    </div>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- 2. SCHEDULE SECTION HEADER -->
        <div class="flex items-end justify-between pt-4">
            <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-lg bg-amber-100/50 flex items-center justify-center"
                >
                    <CalendarDaysIcon class="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3
                        class="text-xl font-bold text-stone-900 flex items-center"
                    >
                        Meeting Schedule
                    </h3>
                    <div
                        class="h-1 w-12 bg-amber-400 rounded-full mt-1.5"
                    ></div>
                </div>
            </div>

            <!-- View Switcher -->
            <Tabs.Root value="week" class="w-[240px]">
                <Tabs.List
                    class="grid w-full grid-cols-3 bg-white border border-stone-200 h-10 p-1 rounded-xl"
                >
                    <Tabs.Trigger
                        value="month"
                        class="text-xs font-semibold rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
                        >Month</Tabs.Trigger
                    >
                    <Tabs.Trigger
                        value="week"
                        class="text-xs font-semibold rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
                        >Week</Tabs.Trigger
                    >
                    <Tabs.Trigger
                        value="day"
                        class="text-xs font-semibold rounded-lg data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
                        >Day</Tabs.Trigger
                    >
                </Tabs.List>
            </Tabs.Root>
        </div>

        <!-- 3. CALENDAR & LIST GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Calendar View (Left, 2/3) -->
            <Card.Root
                class="lg:col-span-2 border-stone-200 shadow-sm rounded-2xl bg-white"
            >
                <Card.Header
                    class="px-6 py-5 border-b border-stone-100 flex flex-row items-center justify-between space-y-0"
                >
                    <div
                        class="flex items-center gap-2 text-stone-800 font-bold"
                    >
                        <CalendarIcon class="w-4 h-4 text-stone-400" />
                        Week of Aug 4 - Aug 10, 2025
                    </div>
                    <div class="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-8 w-8 rounded-lg border-stone-200"
                        >
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            class="h-8 w-8 rounded-lg border-stone-200"
                        >
                            <ChevronRightIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </Card.Header>
                <Card.Content class="p-6">
                    <!-- Day Headers -->
                    <div class="grid grid-cols-7 gap-4 mb-4">
                        {#each days as day}
                            <div
                                class="text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest"
                            >
                                {day}
                            </div>
                        {/each}
                    </div>

                    <!-- Date Grid (Mock Week View) -->
                    <div class="grid grid-cols-7 gap-4 min-h-[300px]">
                        {#each dates as date, i}
                            <div class="flex flex-col items-center gap-3">
                                <!-- Date Number -->
                                <div
                                    class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                                    {date === 6
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                        : 'text-stone-600'}"
                                >
                                    {date}
                                </div>

                                <!-- Events columns -->
                                <div class="w-full flex flex-col gap-2">
                                    {#if date === 6}
                                        <div
                                            class="bg-amber-50 border border-amber-100/50 rounded-xl p-2.5 text-center flex flex-col items-center gap-1"
                                        >
                                            <p
                                                class="text-[10px] font-bold text-amber-700 truncate w-full"
                                            >
                                                Sprint ...
                                            </p>
                                            <div
                                                class="flex items-center gap-1 text-[9px] font-medium text-amber-600/70"
                                            >
                                                <ClockIcon
                                                    class="w-2.5 h-2.5"
                                                /> 10:00 AM
                                            </div>
                                        </div>
                                    {:else if date === 7}
                                        <div
                                            class="bg-stone-50 rounded-xl p-2.5 text-center"
                                        >
                                            <p
                                                class="text-[10px] font-medium text-stone-400"
                                            >
                                                Available
                                            </p>
                                        </div>
                                    {:else if date === 8}
                                        <div
                                            class="bg-amber-50 border border-amber-100/50 rounded-xl p-2.5 text-center flex flex-col items-center gap-1"
                                        >
                                            <p
                                                class="text-[10px] font-bold text-amber-700 truncate w-full"
                                            >
                                                Code ...
                                            </p>
                                            <div
                                                class="flex items-center gap-1 text-[9px] font-medium text-amber-600/70"
                                            >
                                                <ClockIcon
                                                    class="w-2.5 h-2.5"
                                                /> 02:00 PM
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </Card.Content>
            </Card.Root>

            <!-- Upcoming Meetings List (Right, 1/3) -->
            <Card.Root
                class="border-stone-200 shadow-sm rounded-2xl bg-white flex flex-col h-full"
            >
                <Card.Header
                    class="px-6 py-5 border-b border-stone-100 flex flex-row items-center justify-between space-y-0"
                >
                    <div
                        class="flex items-center gap-2 text-stone-800 font-bold"
                    >
                        <ListIcon class="w-4 h-4 text-amber-500" />
                        Upcoming Meetings
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 text-stone-400"
                    >
                        <CalendarIcon class="w-4 h-4" />
                    </Button>
                </Card.Header>

                <Card.Content class="p-5 flex-1 flex flex-col gap-4">
                    {#each upcomingMeetings as meet}
                        <div
                            class="relative flex gap-4 p-4 rounded-xl border border-stone-100 bg-white hover:border-amber-200 hover:shadow-sm transition-all group overflow-hidden"
                        >
                            <!-- Left border accent -->
                            <div
                                class={`absolute left-0 top-0 bottom-0 w-1 ${meet.borderColor}`}
                            ></div>

                            <!-- Date Box -->
                            <div
                                class="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-amber-50 shrink-0"
                            >
                                <span
                                    class="text-[9px] font-bold text-amber-600/70 uppercase"
                                    >{meet.date.split(" ")[0]}</span
                                >
                                <span class="text-sm font-black text-amber-700"
                                    >{meet.date.split(" ")[1]}</span
                                >
                            </div>

                            <!-- Details -->
                            <div
                                class="flex flex-col justify-center flex-1 min-w-0 gap-1.5"
                            >
                                <div
                                    class="flex justify-between items-start gap-2"
                                >
                                    <h4
                                        class="font-bold text-sm text-stone-800 truncate"
                                    >
                                        {meet.title}
                                    </h4>
                                    <span
                                        class={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meet.statusColor}`}
                                    >
                                        {meet.status}
                                    </span>
                                </div>
                                <div
                                    class="flex items-center gap-3 text-xs font-medium text-stone-500"
                                >
                                    <div class="flex items-center gap-1">
                                        <ClockIcon
                                            class="w-3 h-3 text-stone-400"
                                        />
                                        {meet.time}
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <VideoIcon
                                            class="w-3 h-3 text-stone-400"
                                        />
                                        {meet.type}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}

                    <div class="mt-auto pt-2">
                        <Button
                            variant="outline"
                            class="w-full border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 border-dashed rounded-xl h-11 font-semibold"
                        >
                            + Request New Slot
                        </Button>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    {/if}
</div>
