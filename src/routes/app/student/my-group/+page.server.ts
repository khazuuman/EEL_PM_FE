import { changeLeader, getMyGroup, leaveGroup, removeMember, submitGroup } from "$lib/server/groups";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();
    const groupRes = await getMyGroup(event, user.student.studentId);
    console.log("groupRes: ", groupRes.data?.data);
    return {
        group: groupRes.data?.data,
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
};