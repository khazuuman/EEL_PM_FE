//lib/server/chat/index.ts
import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getChatHistory = async (
    event: RequestEvent, groupId: any
) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/chat/${groupId}/history?${url.searchParams.toString()}`
    });
    console.log('response: ', response);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getChatMember = async (
    event: RequestEvent, groupId: any
) => {
    const response = await fetcher({
        event,
        url: `/chat/${groupId}/members`
    });
    console.log('response: ', response);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const uploadChatFile = async (event: RequestEvent, groupId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/chat/${groupId}/upload`,
        method: 'POST',
        formData: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};