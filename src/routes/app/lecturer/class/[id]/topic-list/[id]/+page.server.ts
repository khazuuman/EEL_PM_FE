import { getTopicByClass, getTopicById } from "$lib/server/topics";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;
    const { id } = params;

    // Parse classId trực tiếp từ URL path
    const segments = url.pathname.split("/");
    const classIndex = segments.indexOf("class");
    const classId = segments[classIndex + 1];

    const getTopicByIdRes = await getTopicById(event, id);
    if (!getTopicByIdRes || getTopicByIdRes.status != 200) {
        return fail(404, "Not found topic");
    }
    return {
        topicDetail: getTopicByIdRes?.data?.data,
        classId: classId,
    };
};