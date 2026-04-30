

import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGroupDetail } from '$lib/server/groups';
import { getStudentDetail } from '$lib/server/students';

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;
    const { id } = params;
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");

    const groupResult = await getGroupDetail(event, id);
    console.log("group detail: ", groupResult.data.data);
    if (groupResult.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        groupDetails: groupResult.data.data
    };
};

export const actions: Actions = {
    getStudentDetail: async (event) => {
        const formData = await event.request.formData();
        const stuId = formData.get("stuId");
        const studentRes: any = await getStudentDetail(event, stuId);
        if (!studentRes || studentRes.status != 200) {
            return fail(404, { message: "Not found student" });
        }
        return {
            students: studentRes?.data?.data,
        };
    },
};