import { getDashboardData } from "$lib/server/dashboard";
import { getTopTierGroup } from "$lib/server/groups";
import { getAllSemesters } from "$lib/server/semesters";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { url } = event;
    if (!url.searchParams.has("minScore")) url.searchParams.set("minScore", "7");
    if (!url.searchParams.has("topPercentage")) url.searchParams.set("topPercentage", "30");
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    const [dashboardDataRes, topTierGroupRes, semestersRes] = await Promise.all([getDashboardData(event), getTopTierGroup(event), getAllSemesters(event)]);
    console.log('dashboardDataRes: ', dashboardDataRes?.data?.data);
    console.log('topTierGroupRes: ', topTierGroupRes?.data?.data);
    console.log('semestersRes: ', semestersRes?.data?.data?.data);
    return {
        dashboardData: dashboardDataRes?.data?.data,
        topTierGroups: topTierGroupRes?.data?.data?.data,
        topTierGroupPagination: topTierGroupRes?.data?.data?.pagination,
        semesters: semestersRes?.data?.data?.data,
        filters: {
            page: Number(url.searchParams.get("page")),
            minScore: Number(url.searchParams.get("minScore")),
            topPercentage: Number(url.searchParams.get("topPercentage")),
            semesterId: url.searchParams.get("semesterId") ?? "",
        },
    };
};