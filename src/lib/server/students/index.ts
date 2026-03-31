import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateStudent, UpdateStudent } from "$lib/types/student";

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

export const getStudentsAvailableByClassWithoutFilter = async (event: RequestEvent, classId: any) => {
    const response = await fetcher({ event, url: `/Students/available?classId=${classId}&limit=100` });
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

export const getStudentDetail = async (event: RequestEvent, id: any) => {
    const response = await fetcher({ event, url: `/Students/${id}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createStudent = async (event: RequestEvent, body: CreateStudent) => {
    const response = await fetcher({
        event,
        url: `/Students`,
        method: "POST",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateStudent = async (event: RequestEvent, body: UpdateStudent, id: any) => {
    const response = await fetcher({
        event,
        url: `/Students/${id}`,
        method: "PUT",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteStudent = async (event: RequestEvent, id: any) => {
    const response = await fetcher({
        event,
        url: `/Students/${id}`,
        method: "DELETE",
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};