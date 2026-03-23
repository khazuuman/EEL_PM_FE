import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";

export const getGroups = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/groups?${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getGroupsByClass = async (event: RequestEvent, classId: any) => {
    const { url } = event;
    const response = await fetcher({ event, url: `/groups?ClassId=${classId}&${url.searchParams.toString()}` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createGroup = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: '/groups',
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getMyGroup = async (event: RequestEvent, studentId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/Student/${studentId}`,
        method: 'GET',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getGroupDetail = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}`,
        method: 'GET',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const editMyGroup = async (event: RequestEvent, body: any, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const inviteMember = async (event: RequestEvent, body: any, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/invite-list-student`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const removeMember = async (event: RequestEvent, groupId: any, studentId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/members/${studentId}`,
        method: 'DELETE'
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const submitGroup = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/submit`,
        method: 'POST'
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const changeLeader = async (event: RequestEvent, groupId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/leader`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const approveGroup = async (event: RequestEvent, groupId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/groups/groups/${groupId}/approval`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getGroupRequest = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/requests`,
        method: 'GET',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const leaveGroup = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/leave`,
        method: 'POST',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const joinRequest = async (event: RequestEvent, groupId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/join-requests`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}