
import type { LayoutServerLoad } from "./$types";
import { getAssignmentById } from "$lib/server/assignments";

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const assignmentRes = await getAssignmentById(event, params.assignmentId);
    console.log("assignmentRes: ", assignmentRes?.data?.data);

    return {
        assignment: assignmentRes?.data?.data,
        classId: params.classId
    };
};