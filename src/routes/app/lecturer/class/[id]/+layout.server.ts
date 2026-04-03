// layout.server.ts (lectuerer/class/[id])
import { getClassDetails } from '$lib/server/classes';
import { getApprovedGroupsByClass, getGroups } from '$lib/server/groups';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const classDetails = await getClassDetails(event, params.id);
    const groups = await getApprovedGroupsByClass(event, params.id);
    console.log("class details: ", classDetails.data.data);
    console.log("groups: ", groups?.data?.data?.data);

    return {
        classDetails: classDetails.data.data,
        groups: groups?.data?.data?.data
    };
};
