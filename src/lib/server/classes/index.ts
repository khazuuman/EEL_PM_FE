import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from '../fetcher';
import { safeJsonParse } from '$lib/utils';

export const getClassesForLecturer = async (event: RequestEvent, id: number) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/classes/lecturer/${id}?${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};