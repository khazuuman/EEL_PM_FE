import { APP_LECTURER_MANAGE_STUDENT } from "$lib/constants/depend";
import { getStudentsAvailableByClass } from "$lib/server/students";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createGroup } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { depends, parent } = event;
    depends(APP_LECTURER_MANAGE_STUDENT);
    //class ID
    const { classId } = await parent();

    const studentsRes = await getStudentsAvailableByClass(event, classId);
    console.log("studentsRes: ", studentsRes.data?.data);
    return {
        students: studentsRes?.data?.data ?? [],
        classId,
    };
};

export const actions: Actions = {
    createGroup: async (event) => {
        const formData = await event.request.formData();

        const name = formData.get("name") as string;
        const description = formData.get("description") as string ?? "";
        const studentIds = formData.getAll("studentIds").map(Number);
        const classId = Number(formData.get("classId"));
        if (!name) {
            return fail(400, { message: "Group name is required" });
        }
        if (studentIds.length === 0) {
            return fail(400, { message: "Please add at least one student" });
        }

        if (studentIds.length > 8) {
            return fail(400, { message: "A group cannot have more than 8 students" });
        }

        const result = await createGroup(event, {
            name,
            description,
            classId,
            studentIds,
        });

        if (result.status !== 200) {
            return fail(result.status, {
                error: result.data?.message || 'Update failed'
            });
        }

        return { success: true };
    },
};