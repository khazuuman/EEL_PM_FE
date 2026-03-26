<!-- <script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Select from "$lib/components/ui/select";
    import * as Table from "$lib/components/ui/table";
    import { EllipsisIcon, EyeIcon, UsersIcon } from "@lucide/svelte";
    import type { PageData } from "./$types";
    import { ArrowLeftIcon, XIcon } from "lucide-svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { enhance } from "$app/forms";
    import { toast } from "svelte-sonner";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import Label from "$lib/components/ui/label/label.svelte";

    let { data } = $props<{ data: PageData }>();

    const currentPage = $derived(
        Number(page.url.searchParams.get("page") ?? "1"),
    );
    const totalPages = $derived(
        Math.ceil(data.totalCount / data.pageSize) || 1,
    );

    const pageNumbers = $derived(() => {
        const delta = 2;
        const range: number[] = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        for (let i = left; i <= right; i++) range.push(i);
        return range;
    });
    let searchTerm = $state(page.url.searchParams.get("searchTerm") ?? "");
    let selectedSemester = $state(
        page.url.searchParams.get("semesterId") ?? "",
    );
    let selectedCampus = $state(page.url.searchParams.get("campusId") ?? "");
    let selectedLecturer = $state(
        page.url.searchParams.get("lecturerId") ?? "",
    );
    let debounceTimer: ReturnType<typeof setTimeout>;
    function onSearchInput(e: Event) {
        const v = (e.currentTarget as HTMLInputElement).value;
        searchTerm = v;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateParams({ searchTerm: v, page: "1" });
        }, 400);
    }
    function updateParams(overrides: Record<string, string>) {
        const params = new URLSearchParams(page.url.searchParams);
        for (const [key, value] of Object.entries(overrides)) {
            if (value === "") params.delete(key);
            else params.set(key, value);
        }
        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }

    const statusConfig: Record<string, { label: string; class: string }> = {
        Active: {
            label: "Active",
            class: "border-orange-200 bg-orange-50 text-orange-600",
        },
        Inactive: {
            label: "Inactive",
            class: "border-zinc-200 bg-zinc-100 text-zinc-500",
        },
    };
    function resetFilters() {
        selectedSemester = "";
        selectedCampus = "";
        selectedLecturer = "";
        searchTerm = "";
        goto("?page=1", { keepFocus: true, noScroll: true });
    }

    const hasActiveFilter = $derived(
        !!selectedSemester ||
            !!selectedCampus ||
            !!selectedLecturer ||
            !!searchTerm,
    );

    let dialogOpen = $state(false);
    let pendingClassId = $state<string>("");
    let groupCount = $state<number | "">("");
    let memberCount = $state<number | "">("");

    function handleAllocate(classId: string) {
        pendingClassId = classId;
        groupCount = "";
        memberCount = "";
        dialogOpen = true;
    }
</script> -->

<!-- <div class="space-y-5 p-6 pt-25">
    <a
        class="flex gap-2 w-fit items-center text-xl hover:bg-amber-200 rounded-2xl px-2 py-1 transition-all duration-200 mb-5"
        href="/app"><ArrowLeftIcon />Back to Dashboard</a
    >
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold text-black">Class Grouping</h1>
        <p class="mt-1 text-sm text-zinc-400">
            {data.totalCount} total classes
        </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
        <Input
            type="text"
            placeholder="Search class code..."
            value={searchTerm}
            oninput={onSearchInput}
            class="w-[220px] border-zinc-300 bg-white text-black placeholder:text-zinc-400"
        />
        <Select.Root
            type="single"
            value={selectedSemester}
            onValueChange={(v) => {
                selectedSemester = v;
                updateParams({ semesterId: v, page: "1" });
            }}
        >
            <Select.Trigger
                class="w-[160px] border-zinc-300 bg-white text-black"
            >
                {selectedSemester
                    ? data.semesters.find(
                          (s: any) => s.value === selectedSemester,
                      )?.label
                    : "Semester"}
            </Select.Trigger>
            <Select.Content>
                {#each data.semesters as s}
                    <Select.Item value={s.value}>{s.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Select.Root
            type="single"
            value={selectedCampus}
            onValueChange={(v) => {
                selectedCampus = v;
                updateParams({ campusId: v, page: "1" });
            }}
        >
            <Select.Trigger
                class="w-[200px] border-zinc-300 bg-white text-black"
            >
                {selectedCampus
                    ? data.campuses.find((c: any) => c.value === selectedCampus)
                          ?.label
                    : "Campus"}
            </Select.Trigger>
            <Select.Content>
                {#each data.campuses as c}
                    <Select.Item value={c.value}>{c.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Select.Root
            type="single"
            value={selectedLecturer}
            onValueChange={(v) => {
                selectedLecturer = v;
                updateParams({ lecturerId: v, page: "1" });
            }}
        >
            <Select.Trigger
                class="w-[160px] border-zinc-300 bg-white text-black"
            >
                {selectedLecturer
                    ? data.lecturers.find(
                          (l: any) => l.value === selectedLecturer,
                      )?.label
                    : "Lecturer"}
            </Select.Trigger>
            <Select.Content>
                {#each data.lecturers as l}
                    <Select.Item value={l.value}>{l.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
        {#if hasActiveFilter}
            <Button
                variant="ghost"
                class="text-zinc-500 hover:text-black gap-1.5"
                onclick={resetFilters}
            >
                <XIcon class="size-4" />
                Reset
            </Button>
        {/if}
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border border-zinc-200">
        <Table.Root>
            <Table.Header>
                <Table.Row class="bg-zinc-50 hover:bg-zinc-50 select-none">
                    <Table.Head class="font-semibold text-black"
                        >Class Code</Table.Head
                    >
                    <Table.Head class="font-semibold text-black"
                        >Status</Table.Head
                    >
                    <Table.Head class="font-semibold text-black"
                        >Students</Table.Head
                    >
                    <Table.Head class="font-semibold text-black"
                        >Semester</Table.Head
                    >
                    <Table.Head class="font-semibold text-black"
                        >Campus</Table.Head
                    >
                    <Table.Head class="font-semibold text-black"
                        >Lecturer</Table.Head
                    >
                    <Table.Head class="w-12"></Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#if data.classes.length === 0}
                    <Table.Row>
                        <Table.Cell
                            colspan={7}
                            class="py-16 text-center text-sm text-zinc-400"
                        >
                            No classes found.
                        </Table.Cell>
                    </Table.Row>
                {:else}
                    {#each data.classes as cls (cls.classId)}
                        <Table.Row class="hover:bg-zinc-50 select-none">
                            <Table.Cell class="font-medium text-black"
                                >{cls.classCode}</Table.Cell
                            >
                            <Table.Cell>
                                {@const cfg = statusConfig[cls.status]}
                                {#if cfg}
                                    <Badge class="border text-xs {cfg.class}"
                                        >{cfg.label}</Badge
                                    >
                                {:else}
                                    <span class="text-sm text-zinc-400"
                                        >{cls.status}</span
                                    >
                                {/if}
                            </Table.Cell>
                            <Table.Cell class="text-zinc-700">
                                {cls.currentStudentCount}<span
                                    class="text-zinc-400"
                                    >/{cls.maxStudents}</span
                                >
                            </Table.Cell>
                            <Table.Cell class="text-zinc-700"
                                >{cls.semesterCode}</Table.Cell
                            >
                            <Table.Cell class="text-zinc-700"
                                >{cls.campusName}</Table.Cell
                            >
                            <Table.Cell class="text-zinc-700"
                                >{cls.lecturerName}</Table.Cell
                            >
                            <Table.Cell>
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger>
                                        {#snippet child({ props })}
                                            <Button
                                                {...props}
                                                variant="ghost"
                                                size="icon"
                                                class="size-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                                            >
                                                <EllipsisIcon class="size-4" />
                                            </Button>
                                        {/snippet}
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content
                                        align="end"
                                        class="w-48"
                                    >
                                        <DropdownMenu.Item
                                            class="gap-2 cursor-pointer"
                                            onclick={() =>
                                                goto(
                                                    `/app/academic-staff/auto-allocate-groups/${cls.classId}`,
                                                )}
                                        >
                                            <EyeIcon
                                                class="size-4 text-zinc-500"
                                            />
                                            View Details
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Separator />
                                        <DropdownMenu.Item
                                            class="gap-2 cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                                            onclick={() =>
                                                handleAllocate(cls.classId)}
                                        >
                                            <UsersIcon class="size-4" />
                                            Activate Grouping
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                {/if}
            </Table.Body>
        </Table.Root>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between text-sm text-zinc-500">
        <span>Showing {data.classes.length} of {data.totalCount} classes</span>

        <div class="flex items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onclick={() => updateParams({ page: "1" })}
                class="px-2">«</Button
            >
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onclick={() => updateParams({ page: String(currentPage - 1) })}
                class="px-2">‹</Button
            >

            {#each pageNumbers() as p (p)}
                <Button
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    onclick={() => updateParams({ page: String(p) })}
                    class="w-8 px-0 {p === currentPage
                        ? 'bg-orange-500 text-white hover:bg-orange-600 border-0'
                        : ''}"
                >
                    {p}
                </Button>
            {/each}

            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onclick={() => updateParams({ page: String(currentPage + 1) })}
                class="px-2">›</Button
            >
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onclick={() => updateParams({ page: String(totalPages) })}
                class="px-2">»</Button
            >
        </div>
    </div>
</div>
<!-- Activate Grouping Dialog -->
<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content class="sm:max-w-[400px]">
        <Dialog.Header>
            <Dialog.Title>Activate Grouping</Dialog.Title>
            <Dialog.Description>
                Configure group allocation settings for this class.
            </Dialog.Description>
        </Dialog.Header>

        <form
            method="POST"
            action="?/autoAllocate"
            use:enhance={() => {
                return async ({ result }) => {
                    dialogOpen = false;
                    if (result.type === "success") {
                        toast.success(
                            String(
                                result.data?.message ??
                                    "Grouping activated successfully!",
                            ),
                        );
                    } else if (result.type === "failure") {
                        toast.error(
                            String(
                                result.data?.message ??
                                    "Failed to activate grouping.",
                            ),
                        );
                    } else {
                        toast.error("An unexpected error occurred.");
                    }
                };
            }}
        >
            <input type="hidden" name="classId" value={pendingClassId} />

            <div class="grid gap-4 py-4">
                <div class="grid gap-2">
                    <Label for="groupCount">Number of Groups</Label>
                    <Input
                        id="groupCount"
                        name="groupCount"
                        type="number"
                        min="2"
                        placeholder="e.g. 5"
                        bind:value={groupCount}
                        class="border-zinc-300"
                        required
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="memberCount">Members per Group</Label>
                    <Input
                        id="memberCount"
                        name="memberCount"
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        bind:value={memberCount}
                        class="border-zinc-300"
                        required
                    />
                </div>
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => (dialogOpen = false)}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    class="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!groupCount || !memberCount}
                >
                    Confirm
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root> -->
