<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import {
        ArrowRightIcon,
        BookUserIcon,
        CalendarIcon,
        GraduationCapIcon,
        MapPinIcon,
        SearchIcon,
        UserIcon,
    } from "lucide-svelte";
    import SemesterDropDown from "./components/SemesterDropDown.svelte";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import type { PageData } from "./$types";
    import type { ClassDetail } from "$lib/types/class";
    import type { Semester } from "$lib/types/semester";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";

    let { data } = $props<{ data: PageData }>();
    let searchQuery = $state(page.url.searchParams.get("search") ?? "");

    //Dữ liệu từ server
    const semesters = $derived(data.semesters as Semester[]);
    const classes = $derived(data.classes as ClassDetail[]);
    let selectedSemesterId = $state(
        page.url.searchParams.get("semesterId") ??
            String(data.defaultSemesterId ?? ""),
    );
    let debounceTimer: ReturnType<typeof setTimeout>;

    function updateURL() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set("searchNameAndCode", searchQuery);
            if (selectedSemesterId)
                params.set("semesterId", selectedSemesterId);

            goto(`?${params.toString()}`, {
                replaceState: true, // không tạo history entry mới mỗi lần gõ
                keepFocus: true,
                noScroll: true,
            });
        }, 300);
    }

    // Tự động update URL khi state thay đổi
    $effect(() => {
        searchQuery;
        selectedSemesterId;
        updateURL();
    });
</script>

<div class="flex flex-col h-screen">
    <main
        class="h-full w-screen justify-center items-center bg-stone-100 py-10 px-20 overflow-x-hidden"
    >
        <h1 class="text-3xl font-extrabold mb-2">My Classes</h1>
        <div class="flex flex-col lg:flex-row justify-between">
            <p class="text-xl text-stone-500 mb-3">
                Select one class to manage student and grade.
            </p>
            <div class="flex flex-col lg:flex-row gap-4">
                <div class="relative w-70">
                    <Input
                        id="search"
                        placeholder="Search class code or name..."
                        class="ps-8"
                        bind:value={searchQuery}
                    />
                    <SearchIcon
                        class="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none"
                    />
                </div>
                <SemesterDropDown {semesters} bind:selectedSemesterId />
            </div>
        </div>
        <div class="pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {#each classes as classCard}
                <div
                    class="classCard p-4 border border-stone-300 rounded-md bg-white"
                >
                    <span
                        class="flex justify-between items-center font-bold text-xl mb-4"
                        >{classCard.className}<Badge
                            class="px-3 py-1 bg-green-100 text-green-600"
                            >{classCard.status}</Badge
                        ></span
                    >
                    <div class="flex flex-col gap-2">
                        <span class="flex items-center gap-2 text-stone-600"
                            ><BookUserIcon
                                class="w-5 h-5 text-amber-600"
                            />Class Code: {classCard.classCode}</span
                        >
                        <!-- <span class="flex items-center gap-2 text-stone-600"
                            ><CodepenIcon
                                class="w-5 h-5 text-amber-600"
                            />Number of Students: {classCard.currentStudentCount}</span
                        > -->
                        <span class="flex items-center gap-2 text-stone-600"
                            ><CalendarIcon
                                class="w-5 h-5 text-amber-600"
                            />{classCard.semesterName}</span
                        >
                        <span class="flex items-center gap-2 text-stone-600"
                            ><MapPinIcon
                                class="w-5 h-5 text-amber-600"
                            />{classCard.campusName}</span
                        >
                    </div>
                    <Separator class="my-4" />
                    <div class="flex justify-end">
                        <a
                            class="text-amber-600 text-[17px] flex items-center gap-2"
                            href="/app/lecturer/class/{classCard.classId}"
                            >Manage Class <ArrowRightIcon
                                class="text-amber-600"
                            /></a
                        >
                    </div>
                </div>
            {/each}
        </div>
    </main>
</div>
