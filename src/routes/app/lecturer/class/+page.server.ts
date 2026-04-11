import { APP_CLASSES_LECTURER } from "$lib/constants/depend";
import { getClassesForLecturer } from "$lib/server/classes";
import { getSemesters } from "$lib/server/semesters";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, locals, url } = event;
    const { user } = locals;

    depends(APP_CLASSES_LECTURER);

    const lecturerId = user.lecturer.lecturerId;

    const semesterResult = await getSemesters(event);
    const semesters = semesterResult?.data?.data?.data ?? [];

    const currentSemester = semesters.find(
        (semester: any) => semester.isCurrent === true
    ) ?? null;

    const hasSemesterId = url.searchParams.get("semesterId");
    const hasPage = url.searchParams.get("page");
    const hasLimit = url.searchParams.get("limit");

    // Redirect một lần duy nhất nếu thiếu bất kỳ param mặc định nào
    if (!hasSemesterId || !hasPage || !hasLimit) {
        const newUrl = new URL(url);
        if (!hasSemesterId && currentSemester?.semesterId) {
            newUrl.searchParams.set("semesterId", String(currentSemester.semesterId));
        }
        if (!hasPage) {
            newUrl.searchParams.set("page", "1");
        }
        if (!hasLimit) {
            newUrl.searchParams.set("limit", "10");
        }
        redirect(302, newUrl.pathname + "?" + newUrl.searchParams.toString());
    }

    const pageIndex = Number(url.searchParams.get("page"));
    const limit = Number(url.searchParams.get("limit"));

    const classResult = await getClassesForLecturer(event, lecturerId);
    const classData = classResult?.data?.data;

    return {
        user,
        semesters,
        classes: classData?.data ?? [],
        pageIndex,
        limit,
        totalCount: classData?.pagination?.totalItems ?? 0,
        totalPages: classData?.pagination?.totalPages ?? 1,
        defaultSemesterId: currentSemester?.semesterId ?? null,
    };
};