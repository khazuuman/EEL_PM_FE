import { getAllCourses } from "$lib/server/course";
import { getDashboardData } from "$lib/server/dashboard";
import { getTopTierGroup } from "$lib/server/groups";
import { getAllSemesters } from "$lib/server/semesters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { url } = event;
    const dashboardSemesterId = url.searchParams.get("dashboardSemesterId") ?? "";
    const dashboardCourseId = url.searchParams.get("dashboardCourseId") ?? "";

    if (!url.searchParams.has("minScore")) url.searchParams.set("minScore", "7");
    if (!url.searchParams.has("topPercentage")) url.searchParams.set("topPercentage", "30");
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    const [dashboardDataRes, topTierGroupRes, semestersRes, coursesRes] = await Promise.all([
        getDashboardData(event, {
            semesterId: dashboardSemesterId,
            courseId: dashboardCourseId,
        }),
        getTopTierGroup(event),
        getAllSemesters(event),
        getAllCourses(event)
    ]);

    console.log("dashboardDataRes?.data?.data: ", dashboardDataRes?.data?.data);

    return {
        dashboardData: dashboardDataRes?.data?.data,
        topTierGroups: topTierGroupRes?.data?.data?.data,
        topTierGroupPagination: topTierGroupRes?.data?.data?.pagination,
        semesters: semestersRes?.data?.data?.data,
        courses: coursesRes?.data?.data?.data,
        filters: {
            page: Number(url.searchParams.get("page")),
            minScore: Number(url.searchParams.get("minScore")),
            topPercentage: Number(url.searchParams.get("topPercentage")),
            semesterId: url.searchParams.get("semesterId") ?? "",
        },
        dashboardFilters: { semesterId: dashboardSemesterId, courseId: dashboardCourseId },
    };
};