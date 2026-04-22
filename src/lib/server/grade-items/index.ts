import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { CreateGradeItem, UpdateGradeItem } from "$lib/types/grade-item";


export const getGradeItemByCourseId = async (
    event: RequestEvent, courseId: any
) => {
    const response = await fetcher({
        event,
        url: `/GradeItems/course/${courseId}`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const getGradeItemByClassId = async (
    event: RequestEvent, classId: any
) => {
    const response = await fetcher({
        event,
        url: `/classes/${classId}/grade-items`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const createGradeItem = async (
    event: RequestEvent, body: CreateGradeItem
) => {
    const response = await fetcher({
        event,
        url: `/GradeItems`,
        method: 'POST',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateGradeItem = async (
    event: RequestEvent, body: UpdateGradeItem, gradeItemId: any
) => {
    const response = await fetcher({
        event,
        url: `/GradeItems/${gradeItemId}`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const deleteGradeItem = async (
    event: RequestEvent, gradeItemId: any
) => {
    const response = await fetcher({
        event,
        url: `/GradeItems/${gradeItemId}`,
        method: 'DELETE',
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};