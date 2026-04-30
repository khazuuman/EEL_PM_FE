import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateMentor, UpdateMentor } from "$lib/types/mentor";

export const getMentorInformation = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/groups?ClassId=${classId}&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getMentors = async (
    event: RequestEvent,
    params?: { page?: number; email?: string; limit?: number }
) => {
    const searchParams = new URLSearchParams();
    searchParams.set("IsActive", "true");

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.email) searchParams.set("email", params.email);

    const response = await fetcher({
        event,
        url: `/mentors?${searchParams.toString()}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data,
    };
};

export const getMentorByGroupId = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({ event, url: `/mentors/groups/${groupId}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getMentorGroups = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/mentors/me/group&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getMentorDetails = async (event: RequestEvent, mentorId: any) => {
    const response = await fetcher({ event, url: `/mentors/${mentorId}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createMentor = async (event: RequestEvent, body: CreateMentor) => {
    const response = await fetcher({
        event,
        url: `/mentors`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateMentor = async (event: RequestEvent, body: UpdateMentor, id: any) => {
    const response = await fetcher({
        event,
        url: `/mentors/${id}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const assignMentor = async (event: RequestEvent, groupId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/assign-mentor`,
        method: 'POST',
        data: body
    });
    console.log('assign mentor body: ', body);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteMentor = async (event: RequestEvent, id: any) => {
    const response = await fetcher({
        event,
        url: `/mentors/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const configMaxGroupsPerMentor = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: `/system-settings/mentor`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getConfigMaxGroupsPerMentor = async (event: RequestEvent) => {
    const response = await fetcher({
        event,
        url: `/system-settings/mentor`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};