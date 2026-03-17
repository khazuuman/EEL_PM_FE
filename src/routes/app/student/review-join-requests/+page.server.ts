import { getGroupRequest } from "$lib/server/groups";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const requestRes = await getGroupRequest(event, user.student.group?.groupId);
    return {
        requests: requestRes.data?.data ?? [],
        currentUser: user
    };
};