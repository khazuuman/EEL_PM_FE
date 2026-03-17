import { APP_CLASSES_LECTURER } from "$lib/constants/depend";
import { getClassesForLecturer } from "$lib/server/classes";
import { getSemesters } from "$lib/server/semesters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, locals, url } = event;
    const { user } = locals;

    depends(APP_CLASSES_LECTURER);

    //lecturer ID
    const lecturerId = user.lecturer.lecturerId;

    //semesters
    const semesterResult = await getSemesters(event);
    const semesters = semesterResult?.data?.data?.data ?? [];

    // Tìm semester có startDate lớn nhất
    const latestSemester = semesters.reduce(
        (latest: any, current: any) =>
            new Date(current.startDate) > new Date(latest.startDate)
                ? current
                : latest,
        semesters[0] ?? null
    );

    // Nếu URL chưa có semesterId, tự inject vào searchParams
    if (!url.searchParams.get("semesterId") && latestSemester?.semesterId) {
        url.searchParams.set("semesterId", String(latestSemester.semesterId));
    }


    const classResult = await getClassesForLecturer(event, lecturerId);
    console.log("class: ", classResult);
    return {
        user: user,
        semesters: semesters,
        classes: classResult?.data?.data?.data ?? [],
        pageSize: classResult?.data?.pageSize ?? 0,
        totalCount: classResult?.data?.totalCount ?? 0,
        defaultSemesterId: latestSemester?.semesterId ?? null
    };
};