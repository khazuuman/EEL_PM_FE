import { getTopicByClass } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    const { classDetails } = await parent();

    // Nhận params từ URL
    const searchTerm = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "";

    const getTopicByClassRes = await getTopicByClass(event, classDetails.classId);
    return {
        topics: getTopicByClassRes?.data?.data?.data ?? [],
        classId: classDetails.classId,
        // Trả lại để giữ state trên UI
        searchTerm,
        status,
    };
};