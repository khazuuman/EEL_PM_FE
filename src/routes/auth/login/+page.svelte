<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button";
    import { CircleUserIcon, LoaderIcon, LogInIcon } from "lucide-svelte";
    import { onMount, tick } from "svelte";
    import { toast } from "svelte-sonner";

    let isLoading = $state(false);

    onMount(async () => {
        await tick();

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

<div class="flex flex-col justify-center py-10 px-15 w-120 bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
    <h1 class="text-center font-bold text-3xl mb-2">Sign In</h1>
    <h5 class="text-center text-[16px] text-orange-800 mb-8">
        Experiential Entrepreneurship Learning process management of FPT University Students
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
        <Button
            disabled={isLoading}
            type="submit"
            variant="default"
            class="group w-full bg-amber-400 text-black font-bold h-10 hover:text-white cursor-pointer flex justify-center items-center"
        >
            {#if isLoading}
                <LoaderIcon class="animate-spin h-4 w-4 mr-2" />
                Loading...
            {:else}
                <LogInIcon class="text-black group-hover:text-white h-10 text-center" />
                Login with Google
            {/if}
        </Button>
    </form>

    <Button
        onclick={() => goto("/sso/login-FEID")}
        variant="default"
        class="group bg-white border border-amber-500 text-black font-bold mt-5 h-10 hover:text-amber-600 cursor-pointer flex justify-center items-center mb-10"
    >
        <CircleUserIcon class="text-black group-hover:text-amber-600 h-10 text-center" />
        Login with FEID
    </Button>

    <span class="text-[14px] text-amber-500 text-center block w-full">
        For students from K19 onwards, log in with FEID.
    </span>
</div>