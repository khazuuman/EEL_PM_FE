import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateStaff, UpdateStaff } from "$lib/types/staff";

export const getStaffs = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/Staff?${url.searchParams.toString()}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};

export const getStaffById = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/Staff/${id}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};

export const createStaff = async (
    event: RequestEvent, body: CreateStaff
) => {
    const response = await fetcher({
        event,
        url: `/Staff`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};

export const updateStaff = async (
    event: RequestEvent, id: any, body: UpdateStaff
) => {
    const response = await fetcher({
        event,
        url: `/Staff/${id}`,
        method: 'PUT',
        data: body
    });
    console.log('update body: ', body);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};

export const deleteStaff = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/Staff/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};