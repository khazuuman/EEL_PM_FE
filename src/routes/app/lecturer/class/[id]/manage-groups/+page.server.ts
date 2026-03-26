import { APP_LECTURER_MANAGE_GROUP } from "$lib/constants/depend";
import type { PageServerLoad } from "./$types";
import { getGroupsByClass } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { allocateGroup } from "$lib/server/classes";

export const load: PageServerLoad = async (event) => {
    const { depends, url, parent } = event;
    depends(APP_LECTURER_MANAGE_GROUP);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const { classDetails } = await parent();

    const groupRes = await getGroupsByClass(event, classDetails.classId);
    console.log('groupsRes: ', groupRes?.data?.data?.data);

    return {
        groups: groupRes?.data?.data?.data ?? [],
        pageSize: groupRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: groupRes?.data?.data?.pagination?.totalItems ?? 0,
        classId: classDetails.classId
    };
};

export const actions: Actions = {
    autoAllocate: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");
        const groupCount = Number(formData.get("groupCount"));
        const memberCount = Number(formData.get("memberCount"));

        const allocateGroupRes = await allocateGroup(event, { groupCount, memberCount }, classId);
        console.log("allocateGroupRes res: ", allocateGroupRes);
        if (!allocateGroupRes || allocateGroupRes.status !== 200) {
            return fail(400, {
                message: allocateGroupRes?.data?.message ?? "Failed to allocate group",
            });
        }

        return {
            success: true,
            message: allocateGroupRes?.data?.message ?? null,
        };
    },
};
