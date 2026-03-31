import { getTopicByGroupId } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const TopicsRes = await getTopicByGroupId(event, user.student.group?.groupId);
    console.log("TopicsRes: ", TopicsRes.data?.data);
    return {
        topics: TopicsRes?.data?.data,
        groupId: user.student.group?.groupId
    };
};
