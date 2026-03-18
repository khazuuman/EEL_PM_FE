import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateSemester } from "$lib/types/semester";
import type { CreateCourse, UpdateCourse } from "$lib/types/course";


export const getCourses = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/v1/courses?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCourseDetails = async (
    event: RequestEvent, id: any
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/v1/courses/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createCourse = async (
    event: RequestEvent, body: CreateCourse
) => {
    const response = await fetcher({
        event,
        url: `/v1/courses`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateCourse = async (
    event: RequestEvent, body: UpdateCourse, id: any
) => {
    const response = await fetcher({
        event,
        url: `/v1/courses/${id}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteCourse = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/v1/courses/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};