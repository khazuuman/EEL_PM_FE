import { getStudentDetail } from "$lib/server/students";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const studentRes = await getStudentDetail(event, params.id);
    console.log("studentRes: ", studentRes?.data?.data);
    if (!studentRes || studentRes.status != 200) {
        return fail(404, "Not found student");
    }
    return {
        students: studentRes?.data?.data
    };
};