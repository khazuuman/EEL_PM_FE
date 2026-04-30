import { APP_STAFF_MANAGE_STUDENT } from "$lib/constants/depend";
// import { importMentorData } from "$lib/server/import";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { configMaxGroupsPerMentor, getConfigMaxGroupsPerMentor, getMentors } from "$lib/server/mentor";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_STUDENT);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const [mentorRes, configMaxGroupsRes] = await Promise.all([getMentors(event), getConfigMaxGroupsPerMentor(event)]);

    console.log('mentorRes: ', mentorRes?.data?.data?.data);

    return {
        mentors: mentorRes?.data?.data?.data ?? [],
        pageSize: mentorRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: mentorRes?.data?.data?.pagination?.totalItems ?? 0,
        maxGroupsConfig: configMaxGroupsRes.data?.data,
    };
};

export const actions: Actions = {
    // importMentorData: async (event) => {
    //     const formData = await event.request.formData();

    //     const importRes = await importMentorData(event, formData);
    //     console.log("import res: ", importRes);
    //     if (!importRes || importRes.status !== 200) {
    //         return fail(400, {
    //             message: importRes?.data?.message ?? "Failed to import",
    //         });
    //     }

    //     return {
    //         success: true,
    //         message: importRes?.data?.message ?? null,
    //     };
    // },
    configMaxGroupsPerMentor: async (event) => {
        const formData = await event.request.formData();
        const maxGroupsPerMentor = Number(formData.get("maxGroupsPerMentor"));

        const res = await configMaxGroupsPerMentor(event, { maxGroupsPerMentor });
        console.log("configMaxGroupsPerMentor:", res);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to config max groups per mentor",
            });
        }

        return { success: true };
    }
};
