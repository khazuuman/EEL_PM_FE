import { getMyGroup } from "$lib/server/groups";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    console.log("user in my gorup: ", user);
    const groupRes = await getMyGroup(event, user.student.studentId);
    console.log("groupRes: ", groupRes.data?.data);
    return { group: groupRes.data?.data?.data };
};