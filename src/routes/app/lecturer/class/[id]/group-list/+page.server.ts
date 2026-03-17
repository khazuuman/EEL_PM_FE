import { APP_LECTURER_MANAGE_GROUP } from "$lib/constants/depend";
import { getGroupsByClass } from "$lib/server/groups";
import type { PageServerLoad } from "./$types";

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