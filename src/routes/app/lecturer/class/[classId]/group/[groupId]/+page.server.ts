import { deleteGroup, getGroupDetail, approveGroup, updateGroup } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getStudentDetail, getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import { reviewTopic } from "$lib/server/topics";
import type { ReviewTopic } from "$lib/types/topics";
import { getMentors } from "$lib/server/mentor";
import { getMentorDetails } from "$lib/server/mentor";
import { assignMentor } from "$lib/server/mentor";
import type { UpdateGroup } from "$lib/types/group";

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
                majorName: s.majorName,
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
        const mentorCode = formData.get("mentorCode") as string;
        const mentorEmail = (formData.get("mentorEmail") as string) || null;
        const mentorFullName = (formData.get("mentorFullName") as string) || null;

        const mentorId = mentorIdRaw ? Number(mentorIdRaw) || null : null;

        console.log('mentorCode: ', mentorCode);

        const assignMentorRes = await assignMentor(event, groupId, {
            ...(mentorId ? { mentorId } : {}),
            ...(mentorCode ? { mentorCode } : {}),
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
    update: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");
        const studentIds = formData.getAll("studentIds").map(Number);

        const updateGroupRes = await updateGroup(event, groupId, { studentIds } as UpdateGroup);
        if (!updateGroupRes || updateGroupRes.status !== 200) {
            return fail(400, {
                message: updateGroupRes?.data?.message ?? "Failed to update group",
            });
        }

        return {
            success: true,
            result: updateGroupRes
        }
    },
};