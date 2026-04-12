import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { SetGroupFormationDeadline, SetTopicRegistrationDeadline } from "$lib/types/deadline";

export const getDeadlines = async (
    event: RequestEvent, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/deadlines`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateGroupFormationDeadline = async (
    event: RequestEvent, body: SetGroupFormationDeadline, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/group-formation-deadline`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateTopicRegistrationDeadline = async (
    event: RequestEvent, body: SetTopicRegistrationDeadline, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/topic-registration-deadline`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};