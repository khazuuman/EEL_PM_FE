import { getStudentsAvailableByClass } from "$lib/server/students";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { inviteMember } from "$lib/server/groups";
import { getInvitations } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
    const invitationsRes = await getInvitations(event);
    console.log("invitationsRes: ", invitationsRes.data?.data);
    return {
        invitations: invitationsRes?.data?.data ?? [],
    };
};