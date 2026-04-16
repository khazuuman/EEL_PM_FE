import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateAssignment, GradeAssignment, SubmitAssignment } from "$lib/types/assignment";

export const getOtherAssignments = async (
    event: RequestEvent, classId: any
) => {
    const { url } = event;

    const params = new URLSearchParams();
    const page = url.searchParams.get("page");
    if (page) params.set("page", page);
    // Thêm limit nếu cần: params.set("limit", "5");

    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments?${params.toString()}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCheckpoints = async (
    event: RequestEvent, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments/course-type`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getCheckpointsForStudent = async (
    event: RequestEvent, classId: any, groupId: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/student/checkpoint-outcome?classId=${classId}&groupId=${groupId}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getOtherAssignmentForStudent = async (
    event: RequestEvent, classId: any, groupId: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/student/asignment-other?classId=${classId}&groupId=${groupId}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};


export const getAssignmentById = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getStudentSubmission = async (
    event: RequestEvent, assignmentId: any, groupId: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${assignmentId}/submission?groupId=${groupId}`,
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createAssignment = async (
    event: RequestEvent, body: CreateAssignment, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/assignments`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const submitAssignment = async (
    event: RequestEvent, assignmentId: any, body: SubmitAssignment
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${assignmentId}/submit`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteAssignment = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateAssignment = async (
    event: RequestEvent, body: CreateAssignment, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}`,
        method: 'PUT',
        data: body
    });
    console.log("body: ", body);
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const toggleStatusAssignment = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/assignments/${id}/status`,
        method: 'PATCH',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const uploadFile = async (event: RequestEvent, body: any) => {
    const response = await fetcher({
        event,
        url: `/upload/file`,
        method: 'POST',
        formData: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getSubmissionById = async (
    event: RequestEvent, id: any
) => {
    const response = await fetcher({
        event,
        url: `/submissions/${id}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const gradeSubmission = async (
    event: RequestEvent, body: GradeAssignment, id: any
) => {
    const response = await fetcher({
        event,
        url: `/submissions/${id}/grade`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};