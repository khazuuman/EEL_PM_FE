<!-- layout.svelte (lecturer/class/[id]) -->
<script lang="ts">
    import type { LayoutData } from "./$types";
    import LecturerChatWidget from "$lib/components/chat/lecturerChatComponents/LecturerChatWidget.svelte";
    import { page } from "$app/stores";

    let { data, children } = $props<{ data: LayoutData; children: any }>();

    const user = $page.data.user;
    const token = $page.data.accessToken;
</script>

{@render children()}

{#if user && data.groups && data.groups.length > 0}
    <LecturerChatWidget
        groups={data.groups}
        {token}
        userId={user.userId}
        {user}
    />
{/if}