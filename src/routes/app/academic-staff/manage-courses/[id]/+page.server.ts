import { deleteCourse, updateCourse } from "$lib/server/course";
import { createGradeItem, deleteGradeItem, getGradeItemByCourseId, updateGradeItem } from "$lib/server/grade-items";
import type { UpdateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { CreateGradeItem, UpdateGradeItem } from "$lib/types/grade-item";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { id } = params;
    const gradeItemResult = await getGradeItemByCourseId(event, id);
    console.log("gradeItems: ", gradeItemResult.data.data);
    return {
        gradeItems: gradeItemResult.data.data ?? [],
    };
};

export const actions: Actions = {
    updateCourse: async (event) => {
        const { params } = event;
        const formData = await event.request.formData();
        const courseName = formData.get("courseName") as string;
        const credits = Number(formData.get("credits"));
        const courseDescription = formData.get("courseDescription") as string;
        const isActive = formData.get("isActive") === "true";

        const body: UpdateCourse = {
            courseName,
            courseDescription,
            credits,
            isActive
        }

        console.log("update course body: ", body);

        const updateCourseRes = await updateCourse(event, body, params.id as string);
        console.log("update course:", updateCourseRes);

        if (!updateCourseRes || updateCourseRes.status !== 200) {
            return fail(400, {
                message: updateCourseRes?.data?.message ?? "Failed to update course",
            });
        }

        return {
            success: true,
            group: updateCourseRes?.data?.message ?? null,
        };
    },
    delete: async (event) => {
        const { url, params } = event;
        const redirectTo = url.searchParams.get('redirectTo');

        const deleteCourseRes = await deleteCourse(event, params.id as string);
        if (deleteCourseRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-courses'
            );
        }
        return fail(400, {
            message: deleteCourseRes?.data?.message,
            errors: deleteCourseRes?.data?.errors
        });
    },
    deleteGradeItem: async (event) => {
        const formData = await event.request.formData();
        const gradeItemId = Number(formData.get("gradeItemId"));
        const deleteGradeItemRes = await deleteGradeItem(event, gradeItemId);
        if (!deleteGradeItemRes || deleteGradeItemRes.status !== 200) {
            return fail(400, {
                message: deleteGradeItemRes?.data?.message ?? "Failed to delete grade item",
            });
        }

        return {
            success: true,
            result: deleteGradeItemRes?.data?.message ?? null,
        };
    },
    createGradeItem: async (event) => {
        const formData = await event.request.formData();
        const courseId = Number(formData.get("courseId"));
        const name = formData.get("name") as string;
        const weight = Number(formData.get("weight"));
        const createGradeItemRes = await createGradeItem(event, { courseId, name, weight } as CreateGradeItem);
        if (!createGradeItemRes || createGradeItemRes.status !== 200) {
            return fail(400, {
                message: createGradeItemRes?.data?.message ?? "Failed to create grade item",
            });
        }

        return {
            success: true,
            result: createGradeItemRes?.data?.message ?? null,
        };
    },
    updateGradeItem: async (event) => {
        const formData = await event.request.formData();
        const gradeItemId = Number(formData.get("gradeItemId"));
        const name = formData.get("name") as string;
        const weight = Number(formData.get("weight"));
        const updateGradeItemRes = await updateGradeItem(event, { name, weight } as UpdateGradeItem, gradeItemId);
        if (!updateGradeItemRes || updateGradeItemRes.status !== 200) {
            return fail(400, {
                message: updateGradeItemRes?.data?.message ?? "Failed to update grade item",
            });
        }

        return {
            success: true,
            result: updateGradeItemRes?.data?.message ?? null,
        };
    },
};