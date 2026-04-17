import type { Actions } from "@sveltejs/kit";
import { getStudentDetail } from "$lib/server/students";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getGroupDetail } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const groupDetails = await getGroupDetail(event, params.groupId);
    console.log("groupDetails details: ", groupDetails.data.data);

    return {
        groupDetails: groupDetails.data.data,
    };
};

export const actions: Actions = {
    getStudentDetail: async (event) => {
        const formData = await event.request.formData();
        const stuId = formData.get("stuId");
        const studentRes: any = await getStudentDetail(event, stuId);
        console.log("studentRes: ", studentRes?.data?.data);
        if (!studentRes || studentRes.status != 200) {
            return fail(404, "Not found student");
        }
        return {
            students: studentRes?.data?.data
        };
    },
};