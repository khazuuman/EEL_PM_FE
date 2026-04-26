import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getDashboardData = async (
    event: RequestEvent,
) => {
    const response = await fetcher({
        event,
        url: `/dashboard`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};