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

export const getMentors = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/mentors?${url.searchParams.toString()}` });
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