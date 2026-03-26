import { APP_LECTURER_MANAGE_STUDENT } from "$lib/constants/depend";
import { getMajors } from "$lib/server/majors";
import { getStudentsByClass } from "$lib/server/students";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, parent, url } = event;
    depends(APP_LECTURER_MANAGE_STUDENT);
    //url default
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    //class ID
    const { classDetails } = await parent();
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