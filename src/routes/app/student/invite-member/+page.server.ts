import { getStudentsAvailableByClass, getStudentsAvailableByClassWithoutFilter } from "$lib/server/students";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { inviteMember } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    //class ID
    const { user } = await parent();
    const classId = user.student.classId;

    const studentsRes = await getStudentsAvailableByClassWithoutFilter(event, classId);
    console.log("studentsRes: ", studentsRes);
    return {
        students: studentsRes?.data?.data?.data ?? [],
        user
    };
};

export const actions: Actions = {
    InviteMember: async (event) => {
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
            group: inviteMemberRes?.data?.data ?? null,
        };
    },
};