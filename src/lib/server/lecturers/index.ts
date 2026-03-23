import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getAllLecturers = async (
    event: RequestEvent,
) => {
    const response = await fetcher({
        event,
        url: `/lecturers?limit=100`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};