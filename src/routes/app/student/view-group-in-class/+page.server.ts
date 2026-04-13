import { getGroupDetail, getGroupsByClass, joinRequest } from "$lib/server/groups";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    //class ID
    const { user } = await parent();
    const classId = user.student.classId;
    const groupRes: any = await getGroupsByClass(event, classId);
    console.log("group Res:", groupRes);

    return {
        classId: classId,
        groups: groupRes?.data?.data?.data ?? [],
        totalItems: groupRes?.data?.data?.pagination?.totalItems ?? 0,
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
    joinRequest: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;
        const message = formData.get("message") as string;

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        const joinRequestRes = await joinRequest(event, groupId, { message });

        if (!joinRequestRes || joinRequestRes.status !== 200) {
            return fail(400, { message: joinRequestRes?.data?.message ?? "Failed to create join request" });
        }

        return {
            success: true,
            group: joinRequestRes?.data?.data ?? null,
        };
    },
};
