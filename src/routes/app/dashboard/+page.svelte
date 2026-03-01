<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
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
</script>

<h1>Dashboard</h1>
