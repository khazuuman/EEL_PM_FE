import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getMySentInvitations } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const getMySentInvitationsRes = await getMySentInvitations(event, user.student.group.groupId);
    console.log("getMySentInvitationsRes: ", getMySentInvitationsRes.data?.data);
    return {
        invitations: getMySentInvitationsRes?.data?.data ?? [],
    };
};