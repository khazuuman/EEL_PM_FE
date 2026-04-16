import { getSubmissionById } from "$lib/server/assignments";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { gradeSubmission } from "$lib/server/assignments";
import type { GradeAssignment } from "$lib/types/assignment";

export const load: PageServerLoad = async (event) => {
    const { parent, params } = event;
    // const { classDetails } = await parent();

    const submissionByIdRes = await getSubmissionById(event, params.submissionId);
    console.log("submissionByIdRes: ", submissionByIdRes?.data?.data);

    return {
        submission: submissionByIdRes?.data?.data ?? null,
    };
};

export const actions: Actions = {
    gradeSubmission: async (event) => {
        const formData = await event.request.formData();
        const submissionId = formData.get("submissionId");
        const score = Number(formData.get("score"));
        const feedback = formData.get("feedback") as string;

        const gradeSubmissionRes = await gradeSubmission(event, {
            score: score,
            feedback: feedback,
        } as GradeAssignment, submissionId);
        if (!gradeSubmissionRes || gradeSubmissionRes.status !== 200) {
            return fail(400, gradeSubmissionRes.data?.message ?? "Fail to grade submission");
        }
        return { success: true };
    },
};
