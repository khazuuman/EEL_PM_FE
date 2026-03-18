import { APP_STAFF_MANAGE_CAMPUS } from "$lib/constants/depend";
import { getCampuses } from "$lib/server/campuses";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends } = event;
    depends(APP_STAFF_MANAGE_CAMPUS);

    const campusRes = await getCampuses(event);
    console.log('campusRes: ', campusRes?.data?.data?.data);

    return {
        campuses: campusRes?.data?.data?.data ?? [],
        pageSize: campusRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: campusRes?.data?.data?.pagination?.totalItems ?? 0
    };
};