import { APP_STAFF_MANAGE_SEMESTER } from "$lib/constants/depend";
import { getSemesters } from "$lib/server/semesters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_SEMESTER);
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const semestersRes = await getSemesters(event);

    return {
        semesters: semestersRes?.data?.data?.data ?? [],
        pageSize: semestersRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: semestersRes?.data?.data?.pagination?.totalItems ?? 0
    };
};