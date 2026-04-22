
import type { LayoutServerLoad } from "./$types";
import { getAssignmentById } from "$lib/server/assignments";
import { getGradeItemByClassId } from "$lib/server/grade-items";

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const [assignmentRes, gradeItemsRes] = await Promise.all([getAssignmentById(event, params.assignmentId), getGradeItemByClassId(event, params.classId)])
    console.log("assignmentRes: ", assignmentRes?.data?.data);

    return {
        assignment: assignmentRes?.data?.data,
        gradeItems: gradeItemsRes.data.data ?? [],
        classId: params.classId
    };
};