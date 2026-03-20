import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const importAcademicData = async (
    event: RequestEvent, semesterId: any, campusId: any, formData: FormData
) => {
    const response = await fetcher({
        event: event,
        url: `/v1/import/academic-data?semesterId=${semesterId}&campusId=${campusId}`,
        method: 'POST',
        formData
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const importMentorData = async (
    event: RequestEvent, formData: FormData
) => {
    const response = await fetcher({
        event: event,
        url: `/v1/import/mentors`,
        method: 'POST',
        formData
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};