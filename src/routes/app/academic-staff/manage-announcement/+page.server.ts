import { APP_STAFF_MANAGE_ANNOUNCEMENT } from "$lib/constants/depend";
import { deleteAnnouncement, getAnnouncements } from "$lib/server/announcements";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends } = event;
    depends(APP_STAFF_MANAGE_ANNOUNCEMENT);

    const announcementRes = await getAnnouncements(event);
    console.log('announcementRes: ', announcementRes?.data?.data?.data);

    return {
        announcements: announcementRes?.data?.data?.data ?? [],
        pageSize: announcementRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: announcementRes?.data?.data?.pagination?.totalItems ?? 0
    };
};

export const actions: Actions = {

};