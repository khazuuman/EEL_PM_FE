import { createGroup } from "$lib/server/groups";
import type { CreateGroup } from "$lib/types/group";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAllCampuses } from "$lib/server/campuses";
import { getClassesByCampus } from "$lib/server/classes";
import { getStudentsAvailableByClass } from "$lib/server/students";

export const load: PageServerLoad = async (event) => {
    const campusesRes = await getAllCampuses(event);

    return {
        campuses: (campusesRes?.data?.data?.data ?? []).map((c: any) => ({
            id: c.campusId,
            name: c.campusName,
        })),
    };
};

export const actions: Actions = {
    createGroup: async (event) => {
        const formData = await event.request.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string | undefined;
        const campusId = Number(formData.get("campusId"));
        const classId = Number(formData.get("classId"));
        const studentIds = formData.getAll("studentIds").map(Number);

        const res = await createGroup(event, {
            name,
            description,
            campusId,
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

    getClassesByCampus: async (event) => {
        const formData = await event.request.formData();
        const campusId = Number(formData.get("campusId"));

        const res = await getClassesByCampus(event, campusId);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to load classes",
            });
        }

        return {
            success: true,
            classes: (res.data?.data?.data ?? []).map((c: any) => ({
                id: c.classId,
                name: c.classCode,
            })),
        };
    },

    getAvailableStudentByClass: async (event) => {
        const formData = await event.request.formData();
        const classId = Number(formData.get("classId"));

        const res = await getStudentsAvailableByClass(event, classId);
        console.log("student res: ", res.data?.data);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to load students",
            });
        }

        return {
            success: true,
            students: (res.data?.data ?? []).map((s: any) => ({
                id: s.studentId,
                name: s.name,
                studentCode: s.studentCode,
            })),
        };
    },
};
