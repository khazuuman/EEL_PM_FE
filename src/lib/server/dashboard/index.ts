import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getDashboardData = async (
    event: RequestEvent,
    params?: { semesterId?: string; courseId?: string }
) => {
    const searchParams = new URLSearchParams();
    if (params?.semesterId) searchParams.set("semesterId", params.semesterId);
    if (params?.courseId) searchParams.set("courseId", params.courseId);

    const queryString = searchParams.toString();
    const url = `/dashboard${queryString ? `?${queryString}` : ""}`;

    const response = await fetcher({ event, url });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};