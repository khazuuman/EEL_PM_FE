import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateAssignment } from "$lib/types/assignment";

export const getOtherAssignments = async (
    event: RequestEvent, classId: any
) => {
    const { url } = event;

    const params = new URLSearchParams();
    const page = url.searchParams.get("page");
    if (page) params.set("page", page);
    // Thêm limit nếu cần: params.set("limit", "5");

    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments?${params.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCheckpoints = async (
    event: RequestEvent, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments/course-type`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getAssignmentById = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createAssignment = async (
    event: RequestEvent, body: CreateAssignment, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteAssignment = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateAssignment = async (
    event: RequestEvent, body: CreateAssignment, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const uploadFile = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: `/upload/file`,
        method: 'POST',
        formData: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};