import { getCourseDetails } from "$lib/server/course";


import type { UpdateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { id } = params;
    const [courseResult, gradeItemResult] = await Promise.all([getCourseDetails(event, id), getGradeItemByCourseId(event, id)])
    console.log("course detail: ", courseResult.data.data);
    if (courseResult.status !== 200) {
        throw error(404, {
            message: 'Not found course!'
        });
    }
    const 
    return {
        courseDetails: courseResult.data.data
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
};