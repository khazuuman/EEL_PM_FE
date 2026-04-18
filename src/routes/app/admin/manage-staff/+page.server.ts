import { APP_ADMIN_MANAGE_STAFF } from "$lib/constants/depend";
import { getStaffs } from "$lib/server/staff";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends } = event;
    depends(APP_ADMIN_MANAGE_STAFF);

    const staffsRes = await getStaffs(event);
    console.log('staffsRes: ', staffsRes?.data?.data?.data);

    return {
        staffs: staffsRes?.data?.data?.data ?? [],
        pageSize: staffsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: staffsRes?.data?.data?.pagination?.totalItems ?? 0
    };
};