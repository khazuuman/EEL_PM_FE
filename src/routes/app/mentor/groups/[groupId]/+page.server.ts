import type { Actions } from "@sveltejs/kit";
import { getStudentDetail } from "$lib/server/students";
import { getOtherAssignmentForMentor, getCheckpointsForMentor } from "$lib/server/assignments";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getGroupDetail } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const groupDetails = await getGroupDetail(event, params.groupId);

    const groupId = groupDetails?.data?.data?.groupId;

    const [otherassignmentsRes, checkpointsRes] = await Promise.all([
        getOtherAssignmentForMentor(event, groupId),
        getCheckpointsForMentor(event, groupId),
    ]);

    console.log("others: ", otherassignmentsRes?.data?.data);
    console.log("checkpoints: ", checkpointsRes?.data?.data);

    return {
        groupDetails: groupDetails.data.data,
        otherAssignments: otherassignmentsRes?.data?.data?.data ?? [],
        otherAssignmentsPagination: otherassignmentsRes?.data?.data?.pagination ?? null,
        checkpoints: checkpointsRes?.data?.data ?? [],
    };
};

export const actions: Actions = {
    getStudentDetail: async (event) => {
        const formData = await event.request.formData();
        const stuId = formData.get("stuId");
        const studentRes: any = await getStudentDetail(event, stuId);
        if (!studentRes || studentRes.status != 200) {
            return fail(404, { message: "Not found student" });
        }
        return {
            students: studentRes?.data?.data,
        };
    },
};