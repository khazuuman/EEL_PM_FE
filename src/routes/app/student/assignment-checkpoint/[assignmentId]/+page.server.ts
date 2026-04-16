import { getStudentSubmission, submitAssignment, uploadFile } from "$lib/server/assignments";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import type { LinkSubmit, SubmitAssignment } from "$lib/types/assignment";

export const load: PageServerLoad = async (event) => {
    const { parent, params } = event;
    const { user } = await parent();

    const studentSubmissionRes = await getStudentSubmission(event, params.assignmentId, user?.student?.group?.groupId);

    console.log("user: ", user);

    return {
        submission: studentSubmissionRes?.data?.data ?? null,
        user: user
    };
};

export const actions: Actions = {
    submitAssignment: async (event) => {
        const formData = await event.request.formData();
        const assignmentId = formData.get("assignmentId") as string;
        const fileUrls = formData.getAll("fileUrls") as string[];
        const linksRaw = formData.getAll("links") as string[];
        const notes = formData.get("notes") as string ?? "";

        const links: LinkSubmit[] = linksRaw
            .map((l) => {
                try {
                    return JSON.parse(l) as LinkSubmit;
                } catch {
                    return null;
                }
            })
            .filter((l): l is LinkSubmit => l !== null && !!l.url);

        const submitAssignmentRes = await submitAssignment(event, assignmentId, {
            fileUrls,
            links,
            notes,
        } as SubmitAssignment);

        if (!submitAssignmentRes || submitAssignmentRes.status !== 201) {
            return fail(400, { message: submitAssignmentRes?.data?.message ?? "Fail to submit assignment" });
        }

        return { success: true, data: submitAssignmentRes };
    },
    uploadFile: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file");

        const fd = new FormData();
        fd.append("file", file as Blob);


        const uploadFileRes = await uploadFile(event, fd);

        if (!uploadFileRes || uploadFileRes.status !== 200) {
            return fail(400, {
                message: uploadFileRes?.data?.message ?? "Failed to upload file",
            });
        }

        console.log("upload res: ", uploadFileRes?.data);

        return {
            success: true,
            result: uploadFileRes?.data ?? null,
        };
    },
};