import { APP_STAFF_MANAGE_COURSE } from "$lib/constants/depend";
import { getCourses } from "$lib/server/course";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_COURSE);
    //url default
    // if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    // if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const coursesRes = await getCourses(event);
    console.log('coursesRes: ', coursesRes?.data?.data?.data);

    return {
        courses: coursesRes?.data?.data?.data ?? [],
        pageSize: coursesRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: coursesRes?.data?.data?.pagination?.totalItems ?? 0
    };
};