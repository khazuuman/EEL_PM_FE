<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import {
        BellIcon,
        CalendarDaysIcon,
        CircleCheckIcon,
        EllipsisIcon,
        LockIcon,
        MailIcon,
        PhoneIcon,
        SquareArrowRightExitIcon,
    } from "lucide-svelte";
    import { onMount, tick } from "svelte";
    import { toast } from "svelte-sonner";

    onMount(async () => {
        await tick(); // đợi DOM render xong

        const toastType = page.url.searchParams.get("toast");
        const message = page.url.searchParams.get("message");

        if (toastType === "success") {
            toast.success(message ?? "Login successfully!");
        } else if (toastType === "error") {
            toast.error(decodeURIComponent(message ?? "Internal Server Error"));
        }

        if (toastType) {
            goto(page.url.pathname, { replaceState: true });
        }
    });

    const groupData = [
        {
            fullName: "Nguyen Van A",
            studentCode: "HE312323",
            position: "Leader",
            email: "anv323132@fpt.edu.vn",
        },
        {
            fullName: "Nguyen Van B",
            studentCode: "HE312323",
            position: "Member",
            email: "anv323132@fpt.edu.vn",
        },
        {
            fullName: "Nguyen Van C",
            studentCode: "HE312323",
            position: "Member",
            email: "anv323132@fpt.edu.vn",
        },
        {
            fullName: "Nguyen Van D",
            studentCode: "HE312323",
            position: "Member",
            email: "anv323132@fpt.edu.vn",
        },
        {
            fullName: "Nguyen Van E",
            studentCode: "HE312323",
            position: "Member",
            email: "anv323132@fpt.edu.vn",
        },
        {
            fullName: "Nguyen Van G",
            studentCode: "HE312323",
            position: "Member",
            email: "anv323132@fpt.edu.vn",
        },
    ];
</script>

<div class="bg-stone-200 p-5 w-full h-full">
    <div class="rounded-md bg-white p-4 mb-3">
        <div class="flex gap-3 items-baseline justify-between mb-5">
            <div class="flex gap-3 items-baseline">
                <h2 class="font-bold text-2xl">Student Dashboard</h2>
                <Badge
                    class="bg-green-200 text-green-700 text-[14px] px-4 py-1 font-bold"
                >
                    Approved
                </Badge>
            </div>

            <Button
                variant="outline"
                class="text-red-500 border-red-400 cursor-pointer"
                ><SquareArrowRightExitIcon /> Out Group</Button
            >
        </div>
        <div class="w-full px-6">
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head class="w-1/4">Full Name</Table.Head>
                        <Table.Head class="w-1/4">Student Code</Table.Head>
                        <Table.Head class="w-1/4">Position</Table.Head>
                        <Table.Head class="w-1/4">Email</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each groupData as invoice (invoice)}
                        <Table.Row class="h-12">
                            <Table.Cell class="w-1/4 font-bold"
                                >{invoice.fullName}</Table.Cell
                            >
                            <Table.Cell
                                class="w-1/4 font-semibold text-amber-900"
                                >{invoice.studentCode}</Table.Cell
                            >
                            <Table.Cell class="w-1/4">
                                {#if invoice.position === "Leader"}
                                    <Badge class="bg-amber-200 text-amber-600"
                                        >{invoice.position}</Badge
                                    >
                                {:else}
                                    <Badge class="bg-stone-200 text-stone-600"
                                        >{invoice.position}</Badge
                                    >
                                {/if}
                            </Table.Cell>
                            <Table.Cell
                                class="w-1/4 font-semibold text-amber-900"
                                >{invoice.email}</Table.Cell
                            >
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    </div>
    <div class="flex flex-col lg:flex-row gap-3 mb-3">
        <div class="rounded-md bg-white p-4 flex lg:w-[60%] gap-4">
            <img
                class="w-full sm:w-[40%] rounded-md"
                src="data:image/jpeg;base64,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"
                alt=""
            />
            <div>
                <div class="flex justify-between mb-3">
                    <h3 class="font-bold text-xl">EXE Management System</h3>
                    <Badge
                        class="bg-blue-100 text-blue-600 font-bold rounded-md h-8 w-18"
                        >Working</Badge
                    >
                </div>
                <p class="text-stone-700 text-[14px] mb-3">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Labore porro qui illo velit fuga quos impedit aperiam
                    mollitia voluptas minima, distinctio sunt saepe, natus
                    temporibus blanditiis ea. Earum, optio autem.
                </p>
                <Button class="bg-amber-500 cursor-pointer">View Details</Button
                >
            </div>
        </div>
        <div class="rounded-md bg-white p-4 w-full lg:w-[40%]">
            <h3 class="font-bold text-2xl mb-5">Mentor</h3>
            <div class="flex gap-5 mb-4">
                <img
                    class="w-18 h-18 overflow-hidden object-cover rounded-md"
                    src="data:image/jpeg;base64,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"
                    alt=""
                />
                <span class="flex flex-col font-bold text-[18px]"
                    >Ths. Nguyen Thi Hue <span
                        class="font-medium text-[14px] text-stone-600"
                        >Software Engineering</span
                    ><span class="font-medium text-[14px] text-stone-600"
                        >Department</span
                    ></span
                >
            </div>
            <span class="flex gap-2 items-center mb-2 text-sm sm:text-base"
                ><MailIcon
                    class="w-5 h-5 text-amber-600"
                />huent@fpt.edu.vn</span
            >
            <span class="flex gap-2 items-center mb-2 text-sm sm:text-base"
                ><PhoneIcon class="w-5 h-5 text-amber-600" />0123456789</span
            >
            <span class="flex gap-2 items-center mb-4 text-sm sm:text-base"
                ><CalendarDaysIcon class="w-5 h-5 text-amber-600" />Tuesday &
                Thursday (14:00 - 16:00)</span
            >
            <div class="w-full flex justify-center">
                <Button
                    variant="outline"
                    class="border-amber-600 text-amber-600 cursor-pointer w-full sm:w-auto"
                    >View Mentor Meeting Schedules</Button
                >
            </div>
        </div>
    </div>
    <div class="flex flex-col lg:flex-row gap-3 mb-3">
        <!-- Checkpoints Card -->
        <div class="rounded-md bg-white w-full lg:w-[60%]">
            <h2 class="font-bold text-2xl p-4">Checkpoints Process</h2>
            <Separator class="bg-stone-400" />
            <div class="w-full p-4 flex flex-col gap-5">
                <!-- Card: Graded -->
                <div
                    class="card border border-amber-400 p-4 flex flex-col sm:flex-row items-start sm:items-center rounded-md bg-stone-100 gap-3 sm:justify-between"
                >
                    <div class="flex gap-4 items-center">
                        <span
                            class="rounded-md w-13 h-13 bg-green-200 flex justify-center items-center shrink-0"
                        >
                            <CircleCheckIcon class="text-green-600 w-8 h-8" />
                        </span>
                        <span class="flex flex-col gap-1">
                            <span class="font-bold text-[15px]"
                                >Checkpoint 2: SRS & Prototype</span
                            >
                            <span class="font-medium text-stone-600 text-[13px]"
                                >Deadline: 15/05/2024</span
                            >
                        </span>
                    </div>
                    <div class="flex gap-4 items-center">
                        <Badge
                            class="bg-green-200 text-green-600 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Graded: 9.0</Badge
                        >
                        <Badge
                            class="bg-stone-200 text-stone-600 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Close</Badge
                        >
                    </div>
                </div>

                <!-- Card: Opening -->
                <div
                    class="card border-3 border-amber-500 p-4 flex flex-col sm:flex-row items-start sm:items-center rounded-md bg-yellow-100 gap-3 sm:justify-between"
                >
                    <div class="flex gap-4 items-center">
                        <span
                            class="rounded-md w-13 h-13 bg-amber-200 flex justify-center items-center shrink-0"
                        >
                            <EllipsisIcon class="text-amber-500 w-8 h-8" />
                        </span>
                        <span class="flex flex-col gap-1">
                            <span class="font-bold text-[15px]"
                                >Checkpoint 2: SRS & Prototype</span
                            >
                            <span class="font-medium text-stone-600 text-[13px]"
                                >Deadline: 15/05/2024</span
                            >
                        </span>
                    </div>
                    <div class="flex gap-4 items-center">
                        <Badge
                            class="bg-amber-200 text-amber-800 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Submitted</Badge
                        >
                        <Badge
                            class="bg-amber-600 text-white h-8 w-25 rounded-md font-bold text-[14px]"
                            >Opening</Badge
                        >
                    </div>
                </div>

                <!-- Card: Not Open (x2) -->
                <div
                    class="card border border-stone-400 p-4 flex flex-col sm:flex-row items-start sm:items-center rounded-md bg-stone-50 gap-3 sm:justify-between"
                >
                    <div class="flex gap-4 items-center">
                        <span
                            class="rounded-md w-13 h-13 bg-stone-200 flex justify-center items-center shrink-0"
                        >
                            <LockIcon class="text-stone-400 w-8 h-8" />
                        </span>
                        <span class="flex flex-col gap-1">
                            <span class="font-bold text-[15px] text-stone-400"
                                >Checkpoint 2: SRS & Prototype</span
                            >
                            <span class="font-medium text-[13px] text-stone-400"
                                >Deadline: 15/05/2024</span
                            >
                        </span>
                    </div>
                    <div class="flex gap-4 items-center">
                        <Badge
                            class="bg-stone-100 text-stone-400 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Not Submit</Badge
                        >
                        <Badge
                            class="bg-stone-100 text-stone-400 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Not Open</Badge
                        >
                    </div>
                </div>

                <!-- Card: Not Open (repeat) -->
                <div
                    class="card border border-stone-400 p-4 flex flex-col sm:flex-row items-start sm:items-center rounded-md bg-stone-50 gap-3 sm:justify-between"
                >
                    <div class="flex gap-4 items-center">
                        <span
                            class="rounded-md w-13 h-13 bg-stone-200 flex justify-center items-center shrink-0"
                        >
                            <LockIcon class="text-stone-400 w-8 h-8" />
                        </span>
                        <span class="flex flex-col gap-1">
                            <span class="font-bold text-[15px] text-stone-400"
                                >Checkpoint 2: SRS & Prototype</span
                            >
                            <span class="font-medium text-[13px] text-stone-400"
                                >Deadline: 15/05/2024</span
                            >
                        </span>
                    </div>
                    <div class="flex gap-4 items-center">
                        <Badge
                            class="bg-stone-100 text-stone-400 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Not Submit</Badge
                        >
                        <Badge
                            class="bg-stone-100 text-stone-400 h-8 w-25 rounded-md font-bold text-[14px]"
                            >Not Open</Badge
                        >
                    </div>
                </div>
            </div>
        </div>

        <!-- Notifications Card -->
        <div class="rounded-md bg-white w-full lg:w-[40%]">
            <div class="flex justify-between p-4 items-center">
                <h2 class="font-bold text-2xl">Notifications</h2>
                <a class="text-amber-600 text-[16px] font-bold" href="#"
                    >See All</a
                >
            </div>
            <Separator class="bg-stone-400" />
            <div class="p-4">
                <!-- Lặp lại 4 notification items -->
                <div
                    class="flex items-center gap-3 bg-amber-100 rounded-md px-4 py-2 mb-4"
                >
                    <span
                        class="p-2 w-10 h-10 rounded-full bg-amber-400 shrink-0 flex items-center justify-center"
                    >
                        <BellIcon />
                    </span>
                    <span class="flex flex-col">
                        <span class="font-bold text-[16px]"
                            >Lecturer approved group G01</span
                        >
                        <span class="text-stone-500 text-sm">2 hours ago</span>
                    </span>
                </div>
                <!-- ... repeat for other notifications -->
            </div>
        </div>
    </div>
</div>
