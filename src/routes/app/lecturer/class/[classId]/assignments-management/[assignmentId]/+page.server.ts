import { deleteAssignment } from "$lib/server/assignments";
import { updateAssignment } from "$lib/server/assignments";
import { uploadFile, toggleStatusAssignment } from "$lib/server/assignments";
import type { CreateAssignment } from "$lib/types/assignment";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    updateAssignment: async (event) => {
        const formData = await event.request.formData();
        const assignmentId = formData.get("assignmentId");
        let sequenceNumber = Number(formData.get("sequenceNumber")) || null;
        const type = formData.get("type") as string;
        if (type === "Other")
            sequenceNumber = null;

        const updateAssignmentRes = await updateAssignment(event, {
            title: formData.get("title") as string,
            type: formData.get("type") as string,
            sequenceNumber: sequenceNumber,
            description: formData.get("description") as string ?? "",
            dueDate: new Date(formData.get("dueDate") as string).toISOString(),
            maxScore: Number(formData.get("maxScore")),
            files: formData.getAll("files"),
            status: "Active"
        } as CreateAssignment, assignmentId);
        if (!updateAssignmentRes || updateAssignmentRes.status !== 200) {
            return fail(400, updateAssignmentRes.data?.message ?? "Fail to update assignment");
        }
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
    toggleStatus: async (event) => {
        const formData = await event.request.formData();
        const assignmentId = formData.get("assignmentId");

        const toggleStatusAssignmentRes = await toggleStatusAssignment(event, assignmentId);
        if (!toggleStatusAssignmentRes || toggleStatusAssignmentRes.status !== 200) {
            return fail(400, toggleStatusAssignmentRes.data.message ?? "Fail to update assignment status");
        }
        return {
            success: true,
            data: toggleStatusAssignmentRes
        }
    },
};