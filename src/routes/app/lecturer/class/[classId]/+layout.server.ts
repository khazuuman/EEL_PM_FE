// layout.server.ts (lectuerer/class/[id])
import { getClassDetails } from '$lib/server/classes';
import { getApprovedGroupsByClass } from '$lib/server/groups';
import type { LayoutServerLoad } from '../../$types';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const classDetails = await getClassDetails(event, params.classId);
    const groups = await getApprovedGroupsByClass(event, params.classId);
    // console.log("class details: ", classDetails.data.data);
    // console.log("groups: ", groups?.data?.data?.data);

    return {
        classDetails: classDetails.data.data,
        groups: groups?.data?.data?.data
    };
};
