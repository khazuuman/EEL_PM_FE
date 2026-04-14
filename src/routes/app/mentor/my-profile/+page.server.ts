import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { updateProfile } from '$lib/server/accounts';
import { isValidVietnamesePhone } from '$lib/utils/validation';
import { uploadLogo } from '$lib/server/topics';

export const load: PageServerLoad = async ({ parent, depends }) => {
    depends('profile:user');
    const { user } = await parent();
    return { user };
};

export const actions: Actions = {
    updateProfile: async (event) => {
        const formData = await event.request.formData();
        const phoneNumber = formData.get('phoneNumber') as string;
        const currentCompany = formData.get('currentCompany') as string;
        const fieldOfWork = formData.get('fieldOfWork') as string;
        const biography = formData.get('biography') as string;
        const yearsOfExperience = Number(formData.get('yearsOfExperience'));

        const errors: Record<string, string> = {};

        if (phoneNumber !== '' && !isValidVietnamesePhone(phoneNumber)) {
            errors.phoneNumber = 'Phone number invalid (Ex: 0912345678)';
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, { errors });
        }

        const result = await updateProfile(event, {
            gender: null,
            phoneNumber: phoneNumber || null,
            dateOfBirth: null,
            currentCompany: currentCompany || null,
            currentPosition: null,
            biography: biography || null,
            fieldOfWork: fieldOfWork || null,
            yearsOfExperience: yearsOfExperience || null,
        });

        if (result.status !== 200) {
            return fail(result.status, {
                error: result.data?.message || 'Update failed',
            });
        }

        return { success: true };
    },

    UploadAvatar: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get('file');

        const fd = new FormData();
        fd.append('file', file as Blob);

        const uploadImgRes = await uploadLogo(event, fd);

        if (!uploadImgRes || uploadImgRes.status !== 200) {
            return fail(400, {
                message: uploadImgRes?.data?.message ?? 'Failed to upload avatar',
            });
        }

        return {
            success: true,
            result: uploadImgRes?.data ?? null,
        };
    },
};