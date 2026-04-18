import type { PageServerLoad } from "./$types";
import { getStudentSubmission } from "$lib/server/assignments";

export const load: PageServerLoad = async (event) => {
    const { params } = event;

    const studentSubmissionRes = await getStudentSubmission(event, params.assignmentId, params.groupId);
    console.log("studentSubmissionRes: ", studentSubmissionRes?.data?.data);

    return {
        submission: studentSubmissionRes?.data?.data ?? null,
    };
};