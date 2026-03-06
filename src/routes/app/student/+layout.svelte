<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "./components/app-sidebar.svelte";
    import type { LayoutData } from "../$types";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
    import { page } from "$app/state";
    import { GraduationCapIcon } from "lucide-svelte";
    import NavUser from "./components/nav-user.svelte";
    // import * as Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";

    let { data, children } = $props<{ data: LayoutData; children: any }>();

    // Sidebar mở toàn màn hình nếu đang ở route gốc của student
    // const ROOT_PATH = "/app/student";
    // let isRoot = $derived(page.url.pathname === ROOT_PATH);
    const studentNavData = [
        {
            name: "Groups",
            url: "#",
            //   icon: ComponentIcon,
        },
        {
            name: "My Group",
            url: "#",
            //   icon: DiamondIcon,
        },
        {
            name: "Project/Topic",
            url: "#",
            //   icon: FolderIcon,
        },
        {
            name: "Request",
            url: "#",
            //   icon: ListTodoIcon,
        },
        {
            name: "Assignment/Checkpoint",
            url: "#",
            //   icon: NotebookPenIcon,
        },
        {
            name: "Students",
            url: "#",
            //   icon: UsersIcon,
        },
        {
            name: "Mentor",
            url: "#",
            //   icon: UserCheckIcon,
        },
        {
            name: "News",
            url: "#",
            //   icon: NewspaperIcon,
        },
    ];
</script>

<!-- <Sidebar.Provider
    open={isRoot ? true : undefined}
    class={isRoot ? "w-screen! h-screen! flex flex-col justify-center items-center bg-amber-950" : ""}
>
    <AppSidebar user={data.user} {isRoot} />
    {#if !isRoot}
        <Sidebar.Inset class="flex flex-col overflow-hidden">
            <div
                class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
            >
                <div class="flex items-center gap-2 px-4">
                    <Sidebar.Trigger class="-ms-1" />
                    <Separator
                        orientation="vertical"
                        class="me-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb.Root>
                        <Breadcrumb.List>
                            <Breadcrumb.Item class="hidden md:block">
                                <Breadcrumb.Link href="##"
                                    >Building Your Application</Breadcrumb.Link
                                >
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator class="hidden md:block" />
                            <Breadcrumb.Item>
                                <Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
                            </Breadcrumb.Item>
                        </Breadcrumb.List>
                    </Breadcrumb.Root>
                </div>
            </div>
            <div class="flex-1 flex h-full w-full justify-center items-center">
                {@render children()}
            </div>
        </Sidebar.Inset>
    {/if}
</Sidebar.Provider> -->
<header
    class="px-5 py-2 flex flex-row w-full justify-between items-center gap-10 bg-white border border-amber-600"
>
    <div class="w-full bg-white">
        <div class="flex gap-5">
            <GraduationCapIcon color="#f2a20d" class="w-8 h-8" />
            <div class="text-lg font-bold flex justify-center items-center">
                <h1>EXE</h1>
                <span class="mx-2 h-0.75 w-2.5 bg-black"></span>
                <h1>FPT University Portal</h1>
            </div>
        </div>
    </div>
    <div class="flex flex-row w-160">
        <span
            class="w-90 flex flex-row justify-center items-center text-[18px] text-stone-600 font-bold"
            >Class: {data.user.student?.classCode
                ? data.user.student?.classCode
                : "SE1820"}</span
        >
        <Separator orientation="vertical" class="bg-amber-500 mx-4"/>
        <NavUser user={data.user} />
    </div>
</header>
<div>
    {@render children()}
</div>
