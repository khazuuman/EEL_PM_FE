import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const dataSynchronization = async (event: RequestEvent, body: any) => {
    const response = await fetcher({ event, url: `/sync/full`, method: 'POST', data: body });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};