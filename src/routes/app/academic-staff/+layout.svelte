<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "./components/app-sidebar.svelte";
    import type { LayoutData } from "../$types";
    // import * as Breadcrumb from "$lib/components/ui/breadcrumb/breadcrumb.svelte";

    let { data, children } = $props<{ data: LayoutData; children: any }>();
</script>

<Sidebar.Provider>
    <AppSidebar user={data.user} />
    <Sidebar.Inset class="flex flex-col overflow-hidden">
        <header
            class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
            <div class="flex items-center gap-2 px-4">
                <Sidebar.Trigger class="-ms-1" />
                <!-- <Separator
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
                </Breadcrumb.Root> -->
            </div>
        </header>
        <div class="flex-1 flex h-full w-full justify-center items-center">
            {@render children()}
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
