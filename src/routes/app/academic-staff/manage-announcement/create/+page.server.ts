import { createAnnouncement } from "$lib/server/announcements";
import type { CreateAnnouncement } from "$lib/types/announcement";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    CreateAnnouncement: async (event) => {
        const formData = await event.request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const roleName = formData.getAll("roleName");

        const createAnnouncementRes = await createAnnouncement(event, {
            title,
            content,
            roleName,
        } as CreateAnnouncement);
        console.log("createCourseRes:", createAnnouncementRes);

        if (!createAnnouncementRes || createAnnouncementRes.status !== 201) {
            return fail(400, {
                message: createAnnouncementRes?.data?.message ?? "Failed to create announcement",
            });
        }

        return {
            success: true,
            group: createAnnouncementRes?.data?.message ?? null,
        };
    },
};