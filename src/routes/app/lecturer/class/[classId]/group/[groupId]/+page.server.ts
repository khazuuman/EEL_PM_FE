import { deleteGroup, getGroupDetail, approveGroup } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getStudentDetail, getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import { reviewTopic } from "$lib/server/topics";
import type { ReviewTopic } from "$lib/types/topics";
import { getMentors } from "$lib/server/mentor";
import { getMentorDetails } from "$lib/server/mentor";
import { assignMentor } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { groupId } = params;
    console.log("groupId: ", groupId);
    const groupResult = await getGroupDetail(event, groupId);
    console.log("group detail: ", groupResult.data);
    if (groupResult.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        groupDetails: groupResult.data.data,
    };
};

export const actions: Actions = {
    getGroupUpdateData: async (event) => {
        const { params } = event;
        const groupId = params.groupId;
        const classId = params.classId;
        const [studentRes, groupRes] = await Promise.all([
            getStudentsAvailableByClassWithoutFilter(event, classId),
            getGroupDetail(event, groupId)
        ]);

        if (groupRes.status !== 200) {
            throw error(404, {
                message: 'Not found group!'
            });
        }
        return {
            students: (studentRes.data?.data?.data ?? []).map((s: any) => ({
                id: s.studentId,
                name: s.fullName,
                studentCode: s.studentCode,
            })),
            group: groupRes?.data?.data,
            classId: classId
        };
    },
    delete: async (event) => {
        const classId = event.params.classId;
        const groupId = event.params.groupId;
        const deleteGroupRes = await deleteGroup(event, groupId);
        if (!deleteGroupRes || deleteGroupRes.status !== 200) {
            return fail(400, {
                message: deleteGroupRes?.data?.message ?? "Failed to delete group",
            });
        }

        redirect(303, `/app/lecturer/class/${classId}`);
    },
    getStudentDetail: async (event) => {
        const formData = await event.request.formData();
        const stuId = formData.get("stuId");
        const studentRes: any = await getStudentDetail(event, stuId);
        console.log("studentRes: ", studentRes?.data?.data);
        if (!studentRes || studentRes.status != 200) {
            return fail(404, "Not found student");
        }
        return {
            students: studentRes?.data?.data
        };
    },
    reviewGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;
        const isApproved = formData.get("isApproved") === "true";
        const feedback = formData.get("note") as string ?? "";

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        const approveGroupRes = await approveGroup(event, groupId, {
            isApproved: isApproved,
            feedback: feedback,
        });
        console.log("approveGroupRes Res:", approveGroupRes.data?.data);

        if (!approveGroupRes || approveGroupRes.status !== 200) {
            return fail(400, { message: approveGroupRes?.data?.detail ?? "Failed to update status" });
        }

        return {
            success: true,
            group: approveGroupRes?.data?.data ?? null,
        };
    },
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
