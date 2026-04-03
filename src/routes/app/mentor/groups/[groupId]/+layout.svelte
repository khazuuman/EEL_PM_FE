<!-- layout.svelte (lecturer/class/[id]) -->
<script lang="ts">
    import type { LayoutData } from "./$types";
    import LecturerChatWidget from "$lib/components/chat/lecturerChatComponents/LecturerChatWidget.svelte";
    import { page } from "$app/stores";
    import ChatWidget from "$lib/components/chat/ChatWidget.svelte";

    let { data, children } = $props<{ data: LayoutData; children: any }>();

    const user = $page.data.user;
    const token = $page.data.accessToken;
    const groupDetails = $page.data.groupDetails;
</script>

{@render children()}

{#if user && groupDetails}
    <ChatWidget
        groupId={groupDetails.groupId}
        {token}
        userId={user.userId}
        {user}
    />
{/if}