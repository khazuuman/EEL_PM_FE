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

export const getClasses = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/classes?${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getClassesByCampus = async (event: RequestEvent, campusId: any) => {
    const response = await fetcher({ event, url: `/classes?campusId=${campusId}&limit=100` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getAllClasses = async (event: RequestEvent) => {
    const response = await fetcher({ event, url: `/classes?limit=100` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getClassDetails = async (event: RequestEvent, classId: any) => {
    const response = await fetcher({ event, url: `/classes/${classId}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const allocateGroup = async (event: RequestEvent, body: any, classId: any) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/groups/auto-allocate`,
        data: body,
        method: "POST"
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};