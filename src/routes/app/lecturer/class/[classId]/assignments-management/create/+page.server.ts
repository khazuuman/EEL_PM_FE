import { createAssignment, uploadFile } from "$lib/server/assignments";
import type { CreateAssignment } from "$lib/types/assignment";
import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url, parent }) => {
    const { classDetails } = await parent();
    const type = url.searchParams.get("type") ?? "Checkpoint"; // Checkpoint | Outcome | Other

    return { type, classId: classDetails.classId };
};

export const actions: Actions = {
    createAssignment: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");
        let sequenceNumber;
        if (formData.get("type") as string === 'Other') {
            sequenceNumber = null;
        }
        else {
            sequenceNumber = Number(formData.get("sequenceNumber"))
        }
        const createAssignmentRes = await createAssignment(event, {
            title: formData.get("title") as string,
            type: formData.get("type") as string,
            sequenceNumber: sequenceNumber,
            description: formData.get("description") as string ?? "",
            dueDate: new Date(formData.get("dueDate") as string).toISOString(),
            maxScore: Number(formData.get("maxScore")),
            files: formData.getAll("files"),
            status: "Active"
        } as CreateAssignment, classId);
        console.log('body: ', formData);
        if (!createAssignmentRes || createAssignmentRes.status !== 201) {
            return fail(400, createAssignmentRes.data?.message ?? "Fail to create assignment");
        }
        redirect(303, `/app/lecturer/class/${classId}/assignments-management`);
    },
    uploadFile: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file");

        const fd = new FormData();
        fd.append("file", file as Blob);


        const uploadFileRes = await uploadFile(event, fd);
        console.log("uploadImgRes:", uploadFileRes);

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