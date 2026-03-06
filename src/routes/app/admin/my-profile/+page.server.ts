import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { updateProfile } from '$lib/server/accounts';
import { isValidDateOfBirth, isValidVietnamesePhone, toIsoDate } from '$lib/utils/validation';
import { formatIfDate } from '$lib/utils/date-format';

export const load: PageServerLoad = async ({ parent, depends }) => {
    depends('profile:user');
    const { user } = await parent();
    user.student.dateOfBirth = user.student.dateOfBirth !== null ? formatIfDate(user.student.dateOfBirth) : '';
    console.log("User profile: ", user);
    return { user };
};

export const actions: Actions = {
    updateProfile: async (event) => {
        const formData = await event.request.formData();
        console.log("form data: ", formData);
        const gender = formData.get('gender') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const dateOfBirth = formData.get('dateOfBirth') as string;

        const errors: Record<string, string> = {};

        if (gender !== '' && gender.toLowerCase() !== 'male' && gender.toLowerCase() !== 'female') {
            errors.gender = "Gender only accepts Male or Female"
        }

        if (phoneNumber !== '' && !isValidVietnamesePhone(phoneNumber)) {
            errors.phoneNumber = 'Phone number invalid (Ex: 0912345678)';
        }

        if (dateOfBirth !== '' && !isValidDateOfBirth(dateOfBirth)) {
            errors.dateOfBirth = 'Date format invalid (Ex: 31/12/1999)';
        }


        if (Object.keys(errors).length > 0) {
            return fail(400, { errors });
        }

        const dateOfBirthIso: string | null = dateOfBirth !== '' ? toIsoDate(dateOfBirth) : null;
        const result = await updateProfile(event, {
            gender: gender || null,
            phoneNumber: phoneNumber || null,
            dateOfBirth: dateOfBirthIso,
            currentCompany: null,
            currentPosition: null,
            biography: null,
            fieldOfWork: null,
            yearsOfExperience: null
        });

        if (result.status !== 200) {
            return fail(result.status, {
                error: result.data?.message || 'Update failed'
            });
        }

        return { success: true };
    }
};