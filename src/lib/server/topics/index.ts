import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { ChangeTopic, CreateTopic, ReviewTopic, UpdateTopic } from "$lib/types/topics";

export const getTopicByClass = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/project-topics?classId=${classId}&limit=100&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getPendingTopicByClassId = async (event: RequestEvent, classId: any) => {
    const response = await fetcher({ event, url: `/project-topics/${classId}/pending` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};


export const getTopicById = async (event: RequestEvent, topicId: any) => {
    const response = await fetcher({ event, url: `/project-topics/${topicId}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createTopic = async (event: RequestEvent, body: CreateTopic) => {
    const response = await fetcher({
        event,
        url: `/project-topics`,
        method: "POST",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getTopicByGroupId = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({ event, url: `/project-topics/group/${groupId}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCurrentTopicByGroupId = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({ event, url: `/project-topics/group/${groupId}?isCurrentVersion=true` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCurrentChangeTopicByGroupId = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({ event, url: `/project-topics/group/${groupId}?isChangeRequest=true` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateTopic = async (event: RequestEvent, topicId: any, body: UpdateTopic) => {
    const response = await fetcher({
        event,
        url: `/project-topics/${topicId}`,
        method: "PUT",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const reviewTopic = async (event: RequestEvent, topicId: any, body: ReviewTopic) => {
    const response = await fetcher({
        event,
        url: `/project-topics/${topicId}/approval`,
        method: "PATCH",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const resubmitTopic = async (event: RequestEvent, groupId: any, body: UpdateTopic) => {
    const response = await fetcher({
        event,
        url: `/project-topics/group/${groupId}/resubmit`,
        method: "POST",
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const uploadLogo = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: `/upload/image`,
        method: 'POST',
        formData: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const changeTopic = async (event: RequestEvent, groupId: any, body: ChangeTopic) => {
    const response = await fetcher({
        event,
        url: `/project-topics/${groupId}/change-request`,
        method: "POST",
        data: body
    });
    console.log("change topic body: ", body);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};