import { deleteAnnouncement } from "$lib/server/announcements";
import { deleteCourse, updateCourse } from "$lib/server/course";
import type { UpdateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

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

        const deleteAnnouncementRes = await deleteAnnouncement(event, params.id as string);
        if (deleteAnnouncementRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-announcement'
            );
        }
        return fail(400, {
            message: deleteAnnouncementRes?.data?.detail,
            errors: deleteAnnouncementRes?.data?.errors
        });
    },
};