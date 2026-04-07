import { getStudentDetail } from "$lib/server/students";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { params, url } = event;
    const segments = url.pathname.split("/");
    const classIndex = segments.indexOf("class");
    const classId = segments[classIndex + 1];
    const studentRes: any = await getStudentDetail(event, params.id);
    console.log("studentRes: ", studentRes?.data?.data);
    if (!studentRes || studentRes.status != 200) {
        return fail(404, "Not found student");
    }
    return {
        classId: classId,
        students: studentRes?.data?.data
    };
};