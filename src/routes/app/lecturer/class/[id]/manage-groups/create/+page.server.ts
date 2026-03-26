import { createGroup } from "$lib/server/groups";
import type { CreateGroup } from "$lib/types/group";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getStudentsAvailableByClass } from "$lib/server/students";

export const load: PageServerLoad = async (event) => {
    const { parent } = event;
    const { classDetails } = await parent();

    const res = await getStudentsAvailableByClass(event, classDetails.classId);
        console.log("student res: ", res.data?.data);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to load students",
            });
        }

        return {
            students: (res.data?.data ?? []).map((s: any) => ({
                id: s.studentId,
                name: s.name,
                studentCode: s.studentCode,
            })),
            classId: classDetails.classId
        };
};

export const actions: Actions = {
    createGroup: async (event) => {
        const formData = await event.request.formData();
        // const name = formData.get("name") as string;
        const classId = Number(formData.get("classId"));
        // const description = formData.get("description") as string | undefined;
        const studentIds = formData.getAll("studentIds").map(Number);

        const res = await createGroup(event, {
            // name,
            // description,
            classId,
            studentIds,
        } as CreateGroup);

        if (!res || res.status !== 201) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to create group",
            });
        }

        return { success: true };
    },
};
