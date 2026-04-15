import { deleteAssignment } from "$lib/server/assignments";
import { updateAssignment } from "$lib/server/assignments";
import { createAssignment, uploadFile } from "$lib/server/assignments";
import type { CreateAssignment } from "$lib/types/assignment";
import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

// export const load: PageServerLoad = async ({ url, parent }) => {
//     const { classDetails } = await parent();
//     const type = url.searchParams.get("type") ?? "Checkpoint"; // Checkpoint | Outcome | Other

//     return { type, classId: classDetails.classId };
// };

export const actions: Actions = {
    updateAssignment: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");
        const assignmentId = formData.get("assignmentId");

        const updateAssignmentRes = await updateAssignment(event, {
            title: formData.get("title") as string,
            type: formData.get("type") as string,
            sequenceNumber: Number(formData.get("sequenceNumber")) ?? null,
            description: formData.get("description") as string ?? "",
            dueDate: new Date(formData.get("dueDate") as string).toISOString(),
            maxScore: Number(formData.get("maxScore")),
            files: formData.getAll("files"),
            status: "Active"
        } as CreateAssignment, assignmentId);
        if (!updateAssignmentRes || updateAssignmentRes.status !== 200) {
            return fail(400, updateAssignmentRes.data?.message ?? "Fail to update assignment");
        }
        // redirect(303, `/app/lecturer/class/${classId}/assignments-management`);
        return { success: true };
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