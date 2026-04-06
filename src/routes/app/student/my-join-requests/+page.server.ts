import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { reviewJoinRequest, getMyJoinRequests } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const getMyJoinRequestsRes = await getMyJoinRequests(event);
    console.log("getMyJoinRequestsRes: ", getMyJoinRequestsRes.data?.data);
    return {
        invitations: getMyJoinRequestsRes?.data?.data ?? [],
    };
};
export const actions: Actions = {
    ReviewJoinRequest: async (event) => {
        const formData = await event.request.formData();
        const reqId = Number(formData.get("reqId"));
        const status = formData.get("status") as string;

        const reviewJoinRes = await reviewJoinRequest(event, reqId, { status });

        if (!reviewJoinRes || reviewJoinRes.status !== 200) {
            return fail(400, {
                message: reviewJoinRes?.data?.message ?? "Failed to update request status",
            });
        }

        return {
            success: true,
            group: reviewJoinRes?.data?.data ?? null,
        };
    },
};
