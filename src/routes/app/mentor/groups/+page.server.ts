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

    // Tìm semester có startDate lớn nhất
    const latestSemester = semesters.reduce(
        (latest: any, current: any) =>
            new Date(current.startDate) > new Date(latest.startDate)
                ? current
                : latest,
        semesters[0] ?? null
    );

    if (!url.searchParams.get("semesterId") && latestSemester?.semesterId) {
        const newUrl = new URL(url);
        newUrl.searchParams.set("semesterId", String(latestSemester.semesterId));
        redirect(302, newUrl.pathname + "?" + newUrl.searchParams.toString());
    }

    const groupsResult = await getGroups(event);
    console.log("groups: ", groupsResult?.data?.data);
    return {
        user: user,
        semesters: semesters,
        groups: groupsResult?.data?.data?.data ?? [],
        pageSize: groupsResult?.data?.pageSize ?? 0,
        totalCount: groupsResult?.data?.totalCount ?? 0,
        defaultSemesterId: latestSemester?.semesterId ?? null
    };
};