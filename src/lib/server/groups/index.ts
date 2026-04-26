import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateGroup, UpdateGroup } from "$lib/types/group";

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

export const getApprovedGroupsByClass = async (event: RequestEvent, classId: any) => {
    const response = await fetcher({ event, url: `/groups?ClassId=${classId}&status=Approved&limit=100` });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createGroup = async (event: RequestEvent, body: CreateGroup) => {
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

export const updateGroup = async (event: RequestEvent, groupId: any, body: UpdateGroup) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}/members`,
        method: 'PUT',
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
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const deleteGroup = async (event: RequestEvent, groupId: any) => {
    const response = await fetcher({
        event,
        url: `/groups/${groupId}`,
        method: 'DELETE',
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

export const reviewJoinRequest = async (event: RequestEvent, requestId: any, body: any) => {
    const response = await fetcher({
        event,
        url: `/groups/requests/${requestId}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getMyJoinRequests = async (event: RequestEvent) => {
    const response = await fetcher({
        event,
        url: `/users/me/join-requests`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const getTopTierGroup = async (event: RequestEvent) => {
    const { url } = event;
    const response = await fetcher({
        event,
        url: `/groups/top30?${url.searchParams.toString()}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
}

export const exportTopTierGroup = async (
    event: RequestEvent, body: any
) => {
    const response = await fetcher({
        event: event,
        url: `/export/top30-groups`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};