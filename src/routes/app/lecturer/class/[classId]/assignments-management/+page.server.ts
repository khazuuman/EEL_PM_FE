import { getCheckpoints, getOtherAssignments } from "$lib/server/assignments";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { deleteAssignment } from "$lib/server/assignments";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { parent, url } = event;
    const { classDetails } = await parent();

    const [otherassignmentsRes, checkpointsRes] = await Promise.all([
        getOtherAssignments(event, classDetails.classId), 
        getCheckpoints(event, classDetails.classId),
    ]);

    return {
        otherAssignments: otherassignmentsRes?.data?.data?.data ?? [],
        otherAssignmentsPagination: otherassignmentsRes?.data?.data?.pagination ?? null,
        checkpoints: checkpointsRes?.data?.data ?? [],
        classId: classDetails.classId,
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