import { getCurrentChangeTopicByGroupId } from "$lib/server/topics";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { reviewTopic } from "$lib/server/topics";
import type { ReviewTopic } from "$lib/types/topics";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { classId, groupId } = params;

    const getCurrentChangeTopicRes = await getCurrentChangeTopicByGroupId(event, groupId);
    console.log("current change topic: ", getCurrentChangeTopicRes?.data?.data);

    if (!getCurrentChangeTopicRes || getCurrentChangeTopicRes.status != 200) {
        return fail(404, "Not found topic");
    }

    const allTopics: any[] = getCurrentChangeTopicRes?.data?.data ?? [];

    const pendingTopic = allTopics.find((t) => t.status === "Pending");

    const latestTopic = pendingTopic ?? allTopics.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )[0] ?? null;

    return {
        topicDetail: latestTopic,
        classId,
    };
};

export const actions: Actions = {
    reviewTopic: async (event) => {
        const formData = await event.request.formData();
        const topicId = formData.get("topicId");
        const status = formData.get("isApproved") === "true" ? "Approved" : "Rejected";
        const reviewFeedback = formData.get("note") as string;

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