import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getMajors = async (
    event: RequestEvent,
) => {
    const { url } = event;
    // Clone để không mutate params gốc
    const params = new URLSearchParams(url.searchParams);
    params.set("isActive", "true");
    const response = await fetcher({
        event,
        url: `/majors?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};