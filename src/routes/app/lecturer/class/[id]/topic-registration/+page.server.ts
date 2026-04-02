import { getPendingTopicByClassId, reviewTopic } from "$lib/server/topics";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { ReviewTopic } from "$lib/types/topics";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    const { classDetails } = await parent();

    if (!url.searchParams.has("status")) url.searchParams.set("status", "Pending");
    const getTopicByClassRes = await getPendingTopicByClassId(event, classDetails.classId);
    console.log('getTopicByClassRes: ', getTopicByClassRes?.data?.data);
    return {
        topics: getTopicByClassRes?.data?.data ?? [],
        classId: classDetails.classId,
    };
};

export const actions: Actions = {
    reviewTopic: async (event) => {
        const formData = await event.request.formData();
        const topicId = formData.get("topicId");
        const status = formData.get("status") as string;
        const reviewFeedback = formData.get("reviewFeedback") as string;

        const reviewTopicRes = await reviewTopic(event, topicId,
            {
                status, reviewFeedback
            } as ReviewTopic);
        console.log("reviewTopicRes res: ", reviewTopicRes);
        if (!reviewTopicRes || reviewTopicRes.status !== 200) {
            return fail(400, {
                message: reviewTopicRes?.data?.message ?? "Failed to update status",
            });
        }

        return {
            success: true,
            message: reviewTopicRes?.data?.message ?? null,
        };
    },
};