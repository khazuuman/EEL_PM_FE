import { createCourse } from "$lib/server/course";
import type { CreateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    createCourse: async (event) => {
        const formData = await event.request.formData();
        const courseCode = formData.get("courseCode") as string;
        const courseName = formData.get("courseName") as string;
        const credits = Number(formData.get("credits"));
        const courseDescription = formData.get("courseDescription") as string;
        const isActive = formData.get("isActive") === "true";

        const createCourseRes = await createCourse(event, {
            courseCode,
            courseName,
            courseDescription,
            credits,
            isActive
        } as CreateCourse);
        console.log("createCourseRes:", createCourseRes);

        if (!createCourseRes || createCourseRes.status !== 201) {
            return fail(400, {
                message: createCourseRes?.data?.message ?? "Failed to create course",
            });
        }

        return {
            success: true,
            group: createCourseRes?.data?.message ?? null,
        };
    },
};