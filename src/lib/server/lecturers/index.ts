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

export const getLecturers = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/lecturers?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getLecturerById = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/lecturers/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};