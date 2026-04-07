import { APP_CLASSES_LECTURER } from "$lib/constants/depend";
import { getClassesForLecturer } from "$lib/server/classes";
import { getSemesters } from "$lib/server/semesters";
import { redirect } from "@sveltejs/kit";
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
    console.log("semesters: ", semesterResult?.data?.data?.data);

    // Tìm semester có isCurrent = true
    const currentSemester = semesters.find(
        (semester: any) => semester.isCurrent === true
    ) ?? null;

    if (!url.searchParams.get("semesterId") && currentSemester?.semesterId) {
        const newUrl = new URL(url);
        newUrl.searchParams.set("semesterId", String(currentSemester.semesterId));
        redirect(302, newUrl.pathname + "?" + newUrl.searchParams.toString());
    }

    const classResult = await getClassesForLecturer(event, lecturerId);
    console.log("class: ", classResult?.data?.data?.data);
    return {
        user: user,
        semesters: semesters,
        classes: classResult?.data?.data?.data ?? [],
        pageSize: classResult?.data?.pageSize ?? 0,
        totalCount: classResult?.data?.totalCount ?? 0,
        defaultSemesterId: currentSemester?.semesterId ?? null
    };
};