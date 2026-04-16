import { getCheckpointsForStudent, getOtherAssignmentForStudent } from "$lib/server/assignments";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { deleteAssignment } from "$lib/server/assignments";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { user } = await parent();

    const [otherassignmentsRes, checkpointsRes] = await Promise.all([
        getOtherAssignmentForStudent(event, user?.student?.classId, null),
        getCheckpointsForStudent(event, user?.student?.classId, null),
    ]);

    console.log("other assignment: ", otherassignmentsRes?.data?.data);
    console.log("checkpointsRes: ", checkpointsRes?.data?.data);

    return {
        otherAssignments: otherassignmentsRes?.data?.data?.data ?? [],
        otherAssignmentsPagination: otherassignmentsRes?.data?.data?.pagination ?? null,
        checkpoints: checkpointsRes?.data?.data ?? [],
    };
};

export const actions: Actions = {
    delete: async (event) => {
        const formData = await event.request.formData();
        const assignmentId = formData.get("assignmentId");

        const deleteAssignmentRes = await deleteAssignment(event, assignmentId);
        if (!deleteAssignmentRes || deleteAssignmentRes.status !== 200) {
            return fail(400, deleteAssignmentRes.data.message ?? "Fail to delete assignment");
        }
        return {
            success: true,
            data: deleteAssignmentRes
        }
    },
};