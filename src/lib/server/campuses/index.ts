import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateCampus } from "$lib/types/campus";

export const getCampuses = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/Campus?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCampuseDetail = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/Campus/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createCampus = async (
    event: RequestEvent, body: CreateCampus
) => {
    const response = await fetcher({
        event,
        url: `/Campus`,
        method: "POST",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateCampus = async (
    event: RequestEvent, body: CreateCampus, id: any
) => {
    const response = await fetcher({
        event,
        url: `/Campus/${id}`,
        method: "PUT",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteCampus = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/Campus/${id}`,
        method: "DELETE",
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};