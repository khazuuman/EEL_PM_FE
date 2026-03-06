import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";


export const getSemesters = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/semesters?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};