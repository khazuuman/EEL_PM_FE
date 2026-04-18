import { getAllCampuses } from "$lib/server/campuses";
import { createStaff } from "$lib/server/staff";
import type { CreateStaff } from "$lib/types/staff";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async (event) => {
    const campusesRes = await getAllCampuses(event);
    console.log('campusesRes: ', campusesRes?.data?.data?.data);

    return {
        campuses: campusesRes?.data?.data?.data ?? [],
    };
};

export const actions: Actions = {
    createStaff: async (event) => {
        const formData = await event.request.formData();
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const gender = formData.get("gender") as string;
        const campusId = Number(formData.get("campusId"));

        const createStaffRes = await createStaff(event, {
            fullName: fullName,
            email: email,
            gender: gender,
            campusId: campusId,
        } as CreateStaff);
        console.log("createStaffRes:", createStaffRes);

        if (!createStaffRes || createStaffRes.status !== 201) {
            return fail(400, {
                message: createStaffRes?.data?.message ?? "Failed to create staff",
            });
        }

        return {
            success: true,
            result: createStaffRes?.data?.message ?? null,
        };
    },
};