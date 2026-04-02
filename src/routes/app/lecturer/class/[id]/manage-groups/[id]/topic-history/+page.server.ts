import { getTopicByGroupId } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;
    // Parse classId trực tiếp từ URL path
    const segments = url.pathname.split("/");
    const classIndex = segments.indexOf("class");
    const classId = segments[classIndex + 1];

    // groupId
    const groupId = params.id;
    const TopicsRes = await getTopicByGroupId(event, groupId);
    console.log("TopicsRes: ", TopicsRes.data?.data);
    return {
        topics: TopicsRes?.data?.data,
        classId: classId
    };
};
