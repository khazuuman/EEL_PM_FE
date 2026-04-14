import { changeLeader, getGroupRequest, getMyGroup, leaveGroup, removeMember, submitGroup } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getStudentDetail, getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import { inviteMember } from "$lib/server/groups";
import { reviewJoinRequest } from "$lib/server/groups";
import { getAnnouncementByRole } from "$lib/server/announcements";
import ROLE from "$lib/enums/role";
import { getCurrentTopicByGroupId } from "$lib/server/topics";
import { getInvitations, reviewInviteGroupRequest } from "$lib/server/auth";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const [groupRes, announcementRes, currentTopicRes] = await Promise.all([
        getMyGroup(event, user.student.studentId),
        getAnnouncementByRole(event, ROLE.STUDENT, user.student?.campusId),
        getCurrentTopicByGroupId(event, user.student.group?.groupId)
    ]);
    console.log("currentTopicRes: ", currentTopicRes?.data?.data);

    //leader get join request
    let joinRequests;
    if (user.student?.group?.isLeader === true) {
        const joinRequestsRes = await getGroupRequest(event, user.student.group?.groupId);
        const list = joinRequestsRes?.data?.data;
        if (Array.isArray(list) && list.length > 0) {
            joinRequests = list;
        }
    }

    //member get invitations
    let invitations;
    if (user.student?.group?.isLeader === false || user.student?.group === null) {
        const getInvitationsRes = await getInvitations(event);
        const list = getInvitationsRes.data?.data;
        if (Array.isArray(list) && list.length > 0) {
            invitations = list;
        }
    }
    console.log("invitations: ", invitations);

    return {
        group: groupRes.data?.data,
        currentTopic: currentTopicRes?.data?.data[0],
        joinRequests: joinRequests || [],
        invitations: invitations || [],
        announcements: announcementRes.data?.data?.data || [],
        currentUser: user
    };
};

export const actions: Actions = {
    removeMember: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");
        const studentId = formData.get("studentId");

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        if (!studentId) {
            return fail(400, { message: "StudentId ID is required" });
        }
        console.log('student id: ', studentId);
        const removeMemberRes = await removeMember(event, groupId, studentId);
        console.log("removeMemberRes: ", removeMemberRes);

        if (!removeMemberRes || removeMemberRes.status !== 200) {
            return fail(400, {
                message: removeMemberRes?.data?.message ?? "Failed to remove member",
            });
        }

        return {
            success: true,
            group: removeMemberRes?.data?.data ?? null,
        };
    },
    submitGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }

        const submitGroupRes = await submitGroup(event, groupId);
        console.log("removeMemberRes: ", submitGroupRes);

        if (!submitGroupRes || submitGroupRes.status !== 200) {
            return fail(400, {
                message: submitGroupRes?.data?.message ?? "Failed to submit group",
            });
        }

        return {
            success: true,
            group: submitGroupRes?.data?.data ?? null,
        };
    },
    transferLeader: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");
        const studentId = formData.get("studentId");
        console.log("student id: ", studentId);
        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }
        if (!studentId) {
            return fail(400, { message: "Student ID is required" });
        }
        const transferLeaderRes = await changeLeader(event, groupId, {
            newLeaderId: studentId,
        });
        console.log("transferLeaderRes: ", transferLeaderRes);

        if (!transferLeaderRes || transferLeaderRes.status !== 200) {
            return fail(400, {
                message: transferLeaderRes?.data?.message ?? "Failed to transfer leader",
            });
        }

        return {
            success: true,
            group: transferLeaderRes?.data?.data ?? null,
        };
    },
    leaveGroup: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId");
        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }
        const leaveGroupRes = await leaveGroup(event, groupId);

        if (!leaveGroupRes || leaveGroupRes.status !== 200) {
            return fail(400, {
                message: leaveGroupRes?.data?.message ?? "Failed to leave group",
            });
        }

        return {
            success: true,
            group: leaveGroupRes?.data?.data ?? null,
        };
    },
    getStudentDetail: async (event) => {
        const formData = await event.request.formData();
        const studentId = formData.get("studentId");
        const studentRes: any = await getStudentDetail(event, studentId);
        console.log("getStudentDetail in home: ", studentRes?.data?.data);
        if (!studentRes || studentRes.status != 200) {
            return fail(404, "Not found student");
        }
        return {
            student: studentRes?.data?.data
        };
    },
    getAvailableStudent: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");

        const studentsRes = await getStudentsAvailableByClassWithoutFilter(event, classId);
        console.log("studentsRes: ", studentsRes?.data?.data?.data);
        return {
            students: studentsRes?.data?.data?.data ?? [],
        };
    },
    inviteMember: async (event) => {
        const formData = await event.request.formData();
        const groupId = formData.get("groupId") as string;
        const studentIds = formData.getAll("studentId") as string[];
        const message = formData.get("message") as string;

        if (!groupId) {
            return fail(400, { message: "Group ID is required" });
        }
        if (studentIds.length === 0) return fail(400, { message: "No students selected" });

        const inviteMemberRes = await inviteMember(event, {
            studentIds,
            message,
        }, groupId);
        console.log("invite member Res:", inviteMemberRes);

        if (!inviteMemberRes || inviteMemberRes.status !== 200) {
            return fail(400, {
                message: inviteMemberRes?.data?.message ?? "Failed to invite member",
            });
        }

        return {
            success: true,
            group: inviteMemberRes?.data?.data?.data ?? null,
        };
    },
    reviewJoinRequest: async (event) => {
        const formData = await event.request.formData();
        const reqId = Number(formData.get("reqId"));
        const status = formData.get("status") as string;

        const reviewJoinRes = await reviewJoinRequest(event, reqId, {
            status
        });
        console.log("reviewJoin Res:", reviewJoinRes);

        if (!reviewJoinRes || reviewJoinRes.status !== 200) {
            return fail(400, {
                message: reviewJoinRes?.data?.message ?? "Failed to update request status",
            });
        }

        return {
            success: true,
            group: reviewJoinRes?.data?.data ?? null,
        };
    },
    reviewInviteGroupRequest: async (event) => {
        const formData = await event.request.formData();
        const reqId = Number(formData.get("reqId"));
        const status = formData.get("status") as string;

        const reviewInviteGroupRequestRes = await reviewInviteGroupRequest(event, reqId, {
            status
        });
        console.log("reviewJoin Res:", reviewInviteGroupRequestRes);

        if (!reviewInviteGroupRequestRes || reviewInviteGroupRequestRes.status !== 200) {
            return fail(400, {
                message: reviewInviteGroupRequestRes?.data?.message ?? "Failed to update request status",
            });
        }


        return {
            success: true,
            group: reviewInviteGroupRequestRes?.data?.data ?? null,
        };
    },
};