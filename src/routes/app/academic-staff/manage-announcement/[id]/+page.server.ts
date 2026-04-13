import { updateAnnouncement } from "$lib/server/announcements";
import { deleteAnnouncement } from "$lib/server/announcements";
import { deleteCourse, updateCourse } from "$lib/server/course";
import type { CreateAnnouncement, UpdateAnnouncement } from "$lib/types/announcement";
import type { UpdateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    UpdateAnnouncement: async (event) => {
        const formData = await event.request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const roleName = formData.getAll("roleName");
        const isActive = formData.get("isActive") === "true";
        const announcementId = formData.get("announcementId");

        const updateAnnouncementRes = await updateAnnouncement(event, {
            title,
            content,
            isActive,
            roleName,
        } as UpdateAnnouncement, announcementId);
        console.log("updateAnnouncementRes:", updateAnnouncementRes);

        if (!updateAnnouncementRes || updateAnnouncementRes.status !== 200) {
            return fail(400, {
                message: updateAnnouncementRes?.data?.message ?? "Failed to create announcement",
            });
        }

        return {
            success: true,
            updateRes: updateAnnouncementRes?.data?.message ?? null,
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