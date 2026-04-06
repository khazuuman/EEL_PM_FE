import { APP_LECTURER_MANAGE_GROUP } from "$lib/constants/depend";
import type { PageServerLoad } from "./$types";
import { getGroupsByClass } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { allocateGroup, publicGroup } from "$lib/server/classes";
import type { AllocateGroup } from "$lib/types/group";

export const load: PageServerLoad = async (event) => {
    const { depends, url, parent } = event;
    depends(APP_LECTURER_MANAGE_GROUP);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const { classDetails } = await parent();

    const groupRes = await getGroupsByClass(event, classDetails.classId);
    console.log('groupsRes: ', groupRes?.data?.data);

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
        // const minMembers = Number(formData.get("minMembers"));
        // const maxMembers = Number(formData.get("maxMembers"));
        const groupCount = Number(formData.get("groupCount"));
        // const memberCount = Number(formData.get("memberCount"));

        const allocateGroupRes = await allocateGroup(event,
            {
                groupCount
            } as AllocateGroup, classId);
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
    publicGroup: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");

        const publicGroupRes = await publicGroup(event, classId);
        console.log("publicGroupRes: ", publicGroupRes);
        if (!publicGroupRes || publicGroupRes.status !== 200) {
            return fail(400, {
                message: publicGroupRes?.data?.message ?? "Failed to public group"
            });
        }

        return {
            success: true,
            message: publicGroupRes?.data?.message ?? null,
        };
    },
};
