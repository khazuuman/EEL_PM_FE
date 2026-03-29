import { getGroupRequest, reviewJoinRequest } from "$lib/server/groups";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const requestRes = await getGroupRequest(event, user.student.group?.groupId);
    console.log("request Res: ", requestRes.data?.data);
    return {
        groupId: user.student.group?.groupId,
        requests: requestRes.data?.data ?? [],
        currentUser: user
    };
};

export const actions: Actions = {
    ReviewJoinRequest: async (event) => {
        const formData = await event.request.formData();
        const reqId = Number(formData.get("reqId"));
        const status = formData.get("status") as string;

        const reviewJoinRes = await reviewJoinRequest(event, reqId, {
            status
        });
        console.log("reviewJoin Res:", reviewJoinRes);

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