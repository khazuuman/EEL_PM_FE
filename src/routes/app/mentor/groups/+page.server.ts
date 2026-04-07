import { APP_MENTOR_GROUPS } from "$lib/constants/depend";
import { getSemesters } from "$lib/server/semesters";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getGroups } from "$lib/server/groups";

export const load: PageServerLoad = async (event) => {
    const { depends, locals, url } = event;
    const { user } = locals;

    depends(APP_MENTOR_GROUPS);
    //semesters
    const semesterResult = await getSemesters(event);
    const semesters = semesterResult?.data?.data?.data ?? [];

    // Tìm semester có isCurrent = true
    const currentSemester = semesters.find(
        (semester: any) => semester.isCurrent === true
    ) ?? null;

    if (!url.searchParams.get("semesterId") && currentSemester?.semesterId) {
        const newUrl = new URL(url);
        newUrl.searchParams.set("semesterId", String(currentSemester.semesterId));
        redirect(302, newUrl.pathname + "?" + newUrl.searchParams.toString());
    }

    const groupsResult = await getGroups(event);
    console.log("groups: ", groupsResult?.data?.data);
    return {
        user: user,
        semesters: semesters,
        groups: groupsResult?.data?.data?.data ?? [],
        pageSize: groupsResult?.data?.data?.pagination?.limit ?? 0,
        totalCount: groupsResult?.data?.data?.pagination?.totalItems ?? 0,
        defaultSemesterId: currentSemester?.semesterId ?? null
    };
};