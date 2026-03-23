import { getMajors } from "$lib/server/majors";
import { getStudentsByClass } from "$lib/server/students";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { url, params } = event;
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    //class ID
    const classId = params.id;
    const [studentsRes, majorsRes] = await Promise.all([
        getStudentsByClass(event, classId),
        getMajors(event),
    ]);
    //majors
    const majors = majorsRes?.data?.data?.data.map((m: any) => ({
        label: m.majorName,
        value: String(m.majorId),
        variant: 'primary'
    }));
    return {
        classId: classId,
        majors: majors ?? [],
        students: studentsRes?.data?.data?.data ?? [],
        pageSize: studentsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: studentsRes?.data?.data?.pagination?.totalItems ?? 0
    };
};