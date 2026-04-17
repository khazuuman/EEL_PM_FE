import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";
import { safeJsonParse } from "$lib/utils";
import type { UpdateMailSetting } from "$lib/types/config";

export const getSystemMailSetting = async (
    event: RequestEvent,
) => {
    const response = await fetcher({
        event,
        url: `/system-settings/email`
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};

export const updateSystemMailSetting = async (
    event: RequestEvent, body: UpdateMailSetting
) => {
    const response = await fetcher({
        event,
        url: `/system-settings/email`,
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};