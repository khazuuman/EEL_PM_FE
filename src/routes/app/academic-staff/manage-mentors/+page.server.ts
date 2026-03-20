import { APP_STAFF_MANAGE_STUDENT } from "$lib/constants/depend";
import { importAcademicData, importMentorData } from "$lib/server/import";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { getMentors } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_STUDENT);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const mentorRes = await getMentors(event);

    console.log('mentorRes: ', mentorRes?.data?.data?.data);

    return {
        mentors: mentorRes?.data?.data?.data ?? [],
        pageSize: mentorRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: mentorRes?.data?.data?.pagination?.totalItems ?? 0
    };
};

export const actions: Actions = {
    importMentorData: async (event) => {
        const formData = await event.request.formData();

        const importRes = await importMentorData(event, formData);
        console.log("import res: ", importRes);
        if (!importRes || importRes.status !== 200) {
            return fail(400, {
                message: importRes?.data?.message ?? "Failed to import",
            });
        }

        return {
            success: true,
            message: importRes?.data?.message ?? null,
        };
    },
};
