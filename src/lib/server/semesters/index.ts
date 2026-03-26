import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateSemester, UpdateSemester } from "$lib/types/semester";


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

export const getAllSemesters = async (
    event: RequestEvent,
) => {
    const response = await fetcher({
        event,
        url: `/semesters?isActive=true&limit=100`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getSemesterDetail = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/semesters/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createSemester = async (
    event: RequestEvent, body: CreateSemester
) => {
    const response = await fetcher({
        event,
        url: `/semesters`,
        method: 'POST',
        data: body
    });
    console.log("body: ", body);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateSemester = async (
    event: RequestEvent, body: UpdateSemester, id: any
) => {
    const response = await fetcher({
        event,
        url: `/semesters/${id}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteSemester = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/semesters/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};