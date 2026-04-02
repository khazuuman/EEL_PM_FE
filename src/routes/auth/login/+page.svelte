<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { CAMPUS } from "$lib/enums/campus";
    import { ChevronDownIcon, CircleUserIcon, LoaderIcon, LogInIcon } from "lucide-svelte";
    import { onMount, tick } from "svelte";
    import { toast } from "svelte-sonner";

    let isLoading = $state(false);

    const CAMPUSES = [
        { value: "", label: "Select your campus" },
        ...Object.entries(CAMPUS).map(([key, label]) => ({
            value: key,
            label: label,
        })),
    ];

    type CampusValue = (typeof CAMPUSES)[number]["value"];

    let selectedCampus = $state<CampusValue | null>(null);

    let selectedLabel = $derived(
        CAMPUSES.find((c) => c.value === selectedCampus)?.label ??
            "Select your campus",
    );

        onMount(async () => {
        await tick(); // đợi DOM render xong

        const toastType = page.url.searchParams.get("toast");
        const message = page.url.searchParams.get("message");

        if (toastType === "success") {
            toast.success(message ?? "Logout successfully!");
        } else if (toastType === "error") {
            toast.error(decodeURIComponent(message ?? "Internal Server Error"));
        }

        if (toastType) {
            goto(page.url.pathname, { replaceState: true });
        }
    });
</script>

<div
    class="flex flex-col justify-center py-10 px-15 w-120 bg-white rounded-2xl border-2 border-stone-200 overflow-hidden"
>
    <h1 class="text-center font-bold text-3xl mb-2">Sign In</h1>
    <h5 class="text-center text-[16px] text-orange-800 mb-8">
        FPT University Training Management System
    </h5>
    <form
        method="POST"
        action="?/login"
        use:enhance={() => {
            isLoading = true;
            return async ({ update }) => {
                await update();
                isLoading = false;
            };
        }}
    >
        <DropdownMenu.Label class="font-semibold"
            >Select Campus</DropdownMenu.Label
        >
        <DropdownMenu.Root>
            <DropdownMenu.Trigger class="w-full">
                <Button
                    variant="outline"
                    class="w-full items-center flex justify-between"
                >
                    {selectedLabel}
                    <ChevronDownIcon />
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content class="w-full" align="start">
                <DropdownMenu.Group>
                    {#each CAMPUSES as campus}
                        <DropdownMenu.Item
                            onclick={() => (selectedCampus = campus.value)}
                        >
                            {campus.label}
                        </DropdownMenu.Item>
                    {/each}
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <input type="hidden" name="campus" value={selectedCampus} />
        <Button
            disabled={!selectedCampus || isLoading}
            type="submit"
            variant="default"
            class="group w-full bg-amber-400 text-black font-bold mt-10 h-10 hover:text-white cursor-pointer flex justify-center items-center"
            >{#if isLoading}
                <LoaderIcon class="animate-spin h-4 w-4 mr-2" />
                Loading...
            {:else}
                <LogInIcon
                    class="text-black group-hover:text-white h-10 text-center"
                />
                Login with Google
            {/if}</Button
        >
    </form>
    <Button
        onclick={() => goto("/auth/login-FEID")}
        variant="default"
        class="group bg-white border border-amber-500 text-black font-bold mt-5 h-10 hover:text-amber-600 cursor-pointer flex justify-center items-center mb-10"
        ><CircleUserIcon
            class="text-black group-hover:text-amber-600 h-10 text-center"
        /> Login with FEID</Button
    >

    <span class="text-[14px] text-amber-500 text-center block w-full"
        >For students from K19 onwards, log in with FEID.</span
    >
</div>
