import { APP_LECTURER_MANAGE_STUDENT } from "$lib/constants/depend";
import { getMajors } from "$lib/server/majors";
import { getStudentsByClass } from "$lib/server/students";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, parent, url } = event;
    console.log("🔴 LOAD TRIGGERED - URL:", url.toString());
    console.trace();
    depends(APP_LECTURER_MANAGE_STUDENT);

    const { classDetails } = await parent();
    if (!classDetails.classId) throw error(404, {
        message: 'Not found student!'
    });
    // const page = url.searchParams.get("page") ?? "1";
    const limit = url.searchParams.get("limit") ?? "10";

    // url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);

    const [studentsRes, majorsRes] = await Promise.all([
        getStudentsByClass(event, classDetails.classId),
        getMajors(event),
    ]);
    //majors
    const majors = majorsRes?.data?.data?.data.map((m: any) => ({
        label: m.majorName,
        value: String(m.majorId),
        variant: 'primary'
    }));
    return {
        classId: classDetails.classId,
        majors: majors ?? [],
        students: studentsRes?.data?.data?.data ?? [],
        pageSize: studentsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: studentsRes?.data?.data?.pagination?.totalItems ?? 0
    };
};