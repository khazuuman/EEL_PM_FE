import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getStudentsByClass = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/Students/${classId}/students?${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getStudentsAvailableByClass = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/Students/available?classId=${classId}&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getStudents = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/Students?${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};