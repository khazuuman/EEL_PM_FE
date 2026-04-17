import { getTopicByGroupId } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params } = event;

    const TopicsRes = await getTopicByGroupId(event, params.groupId);
    console.log("TopicsRes: ", TopicsRes.data?.data);
    return {
        topics: TopicsRes?.data?.data,
        classId: params.groupId
    };
};
