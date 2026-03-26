import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getMySentInvitations } from "$lib/server/auth";
import { getInvitations } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
    const getInvitationsRes = await getInvitations(event);
    console.log("getInvitationsRes: ", getInvitationsRes.data?.data);
    return {
        invitations: getInvitationsRes?.data?.data ?? [],
    };
};