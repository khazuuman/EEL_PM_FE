import { getLecturers } from "$lib/server/lecturers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { url } = event;
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const lecturerRes = await getLecturers(event);

    console.log('lecturerRes: ', lecturerRes?.data?.data?.data);

    return {
        lecturers: lecturerRes?.data?.data?.data ?? [],
        pageSize: lecturerRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: lecturerRes?.data?.data?.pagination?.totalItems ?? 0
    };
};