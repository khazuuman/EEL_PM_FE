
import { deleteMentor, updateMentor } from "$lib/server/mentor";
import type { UpdateMentor } from "$lib/types/mentor";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMentorDetails } from '$lib/server/mentor';

export const load: PageServerLoad = async (event) => {
    const { params } = event;
    const { id } = params;
    const mentorResult = await getMentorDetails(event, id);
    console.log("mentor detail: ", mentorResult.data.data);
    if (mentorResult.status !== 200) {
        throw error(404, {
            message: 'Not found mentor!'
        });
    }
    return {
        mentor: mentorResult.data.data,
    };
};


export const actions: Actions = {
    updateMentor: async (event) => {
        const formData = await event.request.formData();
        const id = formData.get("mentorId");
        // Build typed payload trực tiếp
        const payload: UpdateMentor = {
            fullName: formData.get("fullName") as string,
            phoneNumber: formData.get("phoneNumber") as string,
            currentCompany: formData.get("currentCompany") as string,
            currentPosition: formData.get("currentPosition") as string,
            fieldOfWork: formData.get("fieldOfWork") as string,
            biography: formData.get("biography") as string,
            yearsOfExperience: Number(formData.get("yearsOfExperience")),
            isActive: formData.get("isActive") == 'true',
        };

        console.log("payload: ", payload);

        const res = await updateMentor(event, payload, id);
        console.log("updateMentorRes:", res);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to update mentor",
            });
        }

        return { success: true };
    },
    delete: async (event) => {
        const { url, params } = event;
        const redirectTo = url.searchParams.get('redirectTo');

        const deleteMentorRes = await deleteMentor(event, params.id);
        if (deleteMentorRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-mentors'
            );
        }
        return fail(400, {
            message: deleteMentorRes?.data?.detail,
            errors: deleteMentorRes?.data?.errors
        });
    },
};