import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { updateProfile } from '$lib/server/accounts';
import { isValidVietnamesePhone } from '$lib/utils/validation';
import { uploadLogo } from '$lib/server/topics';
import type { UpdateProfileRequest } from '$lib/types/request/updateProfileRequest';

export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent();
    console.log("User profile: ", user);
    return { user };
};

export const actions: Actions = {
    updateProfile: async (event) => {
        const formData = await event.request.formData();
        console.log("form data: ", formData);
        const gender = Number(formData.get('gender'));
        const phoneNumber = formData.get('phoneNumber') as string;
        const avatarUrl = formData.get('avatarUrl') as string;

        const errors: Record<string, string> = {};

        if (phoneNumber !== '' && !isValidVietnamesePhone(phoneNumber)) {
            errors.phoneNumber = 'Phone number invalid (Ex: 0912345678)';
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, { errors });
        }

        const result = await updateProfile(event, {
            gender: gender || null,
            phoneNumber: phoneNumber || null,
            currentCompany: null,
            currentPosition: null,
            biography: null,
            fieldOfWork: null,
            yearsOfExperience: null,
            avatarUrl
        } as UpdateProfileRequest);

        if (result.status !== 200) {
            return fail(result.status, {
                error: result.data?.message || 'Update failed'
            });
        }

        return { success: true };
    },
    UploadLogo: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file");

        const fd = new FormData();
        fd.append("file", file as Blob);


        const uploadImgRes = await uploadLogo(event, fd);
        console.log("uploadImgRes:", uploadImgRes);

        if (!uploadImgRes || uploadImgRes.status !== 200) {
            return fail(400, {
                message: uploadImgRes?.data?.message ?? "Failed to upload logo",
            });
        }

        console.log("upload res: ", uploadImgRes?.data);

        return {
            success: true,
            result: uploadImgRes?.data ?? null,
        };
    },
};