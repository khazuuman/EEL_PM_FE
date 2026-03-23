import { APP_LECTURER_MANAGE_GROUP } from "$lib/constants/depend";
import { getGroupsByClass } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getGroupDetail } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { depends, parent, url } = event;
    depends(APP_LECTURER_MANAGE_GROUP);
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    //class ID
    const { classId } = await parent();

    const groupRes = await getGroupsByClass(event, classId);
    console.log("group Res:", groupRes);

    return {
        classId: classId,
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
};