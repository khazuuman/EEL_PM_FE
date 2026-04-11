import { approveGroup, getGroupDetail, getGroupsByClass } from "$lib/server/groups";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    const { classDetails } = await parent();
    //url default
    url.searchParams.set("Status", "Pending");
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    //class ID
    const groupRes = await getGroupsByClass(event, classDetails.classId);
    console.log("group Res:", groupRes);

    return {
        classId: classDetails.classId,
        groups: groupRes?.data?.data?.data ?? [],
        totalItems: groupRes?.data?.data?.paging?.totalItems ?? 0,
    };
};
export const actions: Actions = {
    getGroupDetail: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        const groupDetailRes = await getGroupDetail(event, groupId);
        console.log("group Detail Res:", groupDetailRes.data?.data);

        if (!groupDetailRes || groupDetailRes.status !== 200) {
            return fail(400, { message: groupDetailRes?.data?.detail ?? "Failed to get group detail" });
        }

        return {
            success: true,
            group: groupDetailRes?.data?.data ?? null,
        };
    },
    approveGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;
        const isApproved = formData.get("isApproved") === "true";
        const feedback = formData.get("feedback") as string ?? "";

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        const approveGroupRes = await approveGroup(event, groupId, {
            isApproved: isApproved,
            feedback: feedback,
        });
        console.log("approveGroupRes Res:", approveGroupRes.data?.data);

        if (!approveGroupRes || approveGroupRes.status !== 200) {
            return fail(400, { message: approveGroupRes?.data?.detail ?? "Failed to update status" });
        }

        return {
            success: true,
            group: approveGroupRes?.data?.data ?? null,
        };
    },
};
