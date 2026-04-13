import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateAnnouncement, UpdateAnnouncement } from "$lib/types/announcement";

export const getAnnouncements = async (
    event: RequestEvent,
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/announcements?${url.searchParams.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getAnnouncementDetail = async (
    event: RequestEvent, id: number
) => {
    const response = await fetcher({
        event,
        url: `/announcements/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getAnnouncementByRole = async (
    event: RequestEvent, roleName: string, campusId: any
) => {
    const { url } = event;
    const params = new URLSearchParams(url.searchParams);

    // if (!params.has("page")) params.set("page", "1");
    // if (!params.has("limit")) params.set("limit", "100");
    const response = await fetcher({
        event,
        url: `/announcements/targeted?roleName=${roleName}&campusId=${campusId}&page=1&limit=100`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createAnnouncement = async (
    event: RequestEvent, body: CreateAnnouncement
) => {
    const response = await fetcher({
        event,
        url: `/announcements`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateAnnouncement = async (
    event: RequestEvent, body: UpdateAnnouncement, id: any
) => {
    const response = await fetcher({
        event,
        url: `/announcements/${id}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteAnnouncement = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/announcements/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};