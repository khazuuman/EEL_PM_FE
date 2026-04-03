// layout.server.ts (lectuerer/class/[id])
import { getGroupDetail } from '$lib/server/groups';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const groupDetails = await getGroupDetail(event, params.groupId);
    console.log("groupDetails details: ", groupDetails.data.data);

    return {
        groupDetails: groupDetails.data.data,
    };
};
