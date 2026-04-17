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
    const { topicId } = params;
    const getTopicByIdRes = await getTopicById(event, topicId);
    if (!getTopicByIdRes || getTopicByIdRes.status != 200) {
        return fail(404, "Not found topic");
    }

    return {
        topicDetail: getTopicByIdRes?.data?.data,
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
        const { params, request } = event;

        // FIX: Đọc page và email từ formData thay vì url.searchParams
        const formData = await request.formData();
        const page = Number(formData.get("page") ?? 1);
        const email = (formData.get("email") as string) ?? "";

        const mentorRes = await getMentors(event, { page, email });

        console.log("mentorRes data:", mentorRes.data?.data);

        // FIX: Tách đúng data và pagination từ response
        const responseData = mentorRes?.data?.data;

        return {
            mentors: responseData?.data || [],
            // FIX: pagination nằm ở responseData.pagination, không phải responseData.data.pagination
            pagination: {
                page: responseData?.pagination?.page ?? page,
                limit: responseData?.pagination?.limit ?? 20,
                totalItems: responseData?.pagination?.totalItems ?? 0,
                totalPages: responseData?.pagination?.totalPages ?? 0,
            },
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
        const mentorIdRaw = formData.get("mentorId");
        const mentorEmail = (formData.get("mentorEmail") as string) || null;
        const mentorFullName = (formData.get("mentorFullName") as string) || null;

        const mentorId = mentorIdRaw ? Number(mentorIdRaw) || null : null;

        const assignMentorRes = await assignMentor(event, groupId, {
            ...(mentorId ? { mentorId } : {}),
            ...(mentorEmail ? { mentorEmail } : {}),
            ...(mentorFullName ? { mentorFullName } : {}),
        });

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