import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getMySentInvitations } from "$lib/server/auth";
import { getInvitations } from "$lib/server/auth";
import { reviewJoinRequest } from "$lib/server/groups";
import { reviewInviteGroupRequest } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
    const getInvitationsRes = await getInvitations(event);
    console.log("getInvitationsRes: ", getInvitationsRes.data?.data);
    return {
        invitations: getInvitationsRes?.data?.data ?? [],
    };
};

export const actions: Actions = {
    reviewInviteGroupRequest: async (event) => {
        const formData = await event.request.formData();
        const reqId = Number(formData.get("reqId"));
        const status = formData.get("status") as string;

        const reviewInviteGroupRequestRes = await reviewInviteGroupRequest(event, reqId, {
            status
        });
        console.log("reviewJoin Res:", reviewInviteGroupRequestRes);

        if (!reviewInviteGroupRequestRes || reviewInviteGroupRequestRes.status !== 200) {
            return fail(400, {
                message: reviewInviteGroupRequestRes?.data?.message ?? "Failed to update request status",
            });
        }


        return {
            success: true,
            group: reviewInviteGroupRequestRes?.data?.data ?? null,
        };
    },
};