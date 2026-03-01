import type { UpdateProfileRequest } from "$lib/types/request/updateProfileRequest";
import { safeJsonParse } from "$lib/utils";
import type { RequestEvent } from "@sveltejs/kit";
import { fetcher } from "../fetcher";

export const updateProfile = async (event: RequestEvent, body: UpdateProfileRequest) => {
    const response = await fetcher({
        event,
        url: '/profile/me',
        method: 'PUT',
        data: body
    });
    const data = await safeJsonParse(response);
    return {
        status: response.status,
        data: data
    };
};