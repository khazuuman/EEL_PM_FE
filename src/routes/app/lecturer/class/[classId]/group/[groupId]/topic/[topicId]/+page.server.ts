import { getTopicById } from "$lib/server/topics";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { reviewTopic } from "$lib/server/topics";
import type { ReviewTopic } from "$lib/types/topics";
import { getMentorDetails } from "$lib/server/mentor";
import { assignMentor } from "$lib/server/mentor";
import { getMentors } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { topicId, classId } = params;
    // console.log("=== load function called ===");
    const getTopicByIdRes = await getTopicById(event, topicId);
    // console.log('topic detail: ', getTopicByIdRes?.data?.data);
    // console.log("=== topic mentor after reload ===", getTopicByIdRes?.data?.data?.mentor);
    if (!getTopicByIdRes || getTopicByIdRes.status != 200) {
        return fail(404, "Not found topic");
    }

    return {
        topicDetail: getTopicByIdRes?.data?.data,
        classId: classId,
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
    getMentors: async (event) => {
        const { params, url } = event;

        const limit = url.searchParams.get("limit") ?? "10";
        url.searchParams.set("limit", limit);

        const mentorRes = await getMentors(event);

        console.log("mentorRes: ", mentorRes.data?.data?.data);
        return {
            mentors: mentorRes?.data?.data?.data || [],
            classId: params.classId
        };
    },
    getMentorDetail: async (event) => {
        const formData = await event.request.formData();
        const mentorId = formData.get("mentorId");
        const getMentorDetailsRes = await getMentorDetails(event, mentorId);
        if (!getMentorDetailsRes || getMentorDetailsRes.status !== 200) {
            return fail(400, {
                message: getMentorDetailsRes?.data?.message ?? "Failed to get mentor",
            });
        }

        return {
            mentorDetails: getMentorDetailsRes?.data?.data,
        };
    },
    assignMentor: async (event) => {
        const formData = await event.request.formData();
        const groupId = Number(formData.get("groupId"));
        const mentorId = Number(formData.get("mentorId"));
        const assignMentorRes = await assignMentor(event, groupId, { mentorId });
        if (!assignMentorRes || assignMentorRes.status !== 200) {
            return fail(400, {
                message: assignMentorRes?.data?.message ?? "Failed to assign mentor",
            });
        }

        return {
            mentorDetails: assignMentorRes?.data?.data,
        };
    },
};