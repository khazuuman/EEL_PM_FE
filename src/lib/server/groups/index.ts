import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getGroupsByClass = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/groups?ClassId=${classId}&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createGroup = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: '/groups',
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getMyGroup = async (event: RequestEvent, studentId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${studentId}`,
        method: 'GET',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}