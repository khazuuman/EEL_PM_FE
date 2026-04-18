import { deleteStaff, updateStaff } from "$lib/server/staff";
import type { UpdateStaff } from "$lib/types/staff";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { getAllCampuses } from "$lib/server/campuses";

export const load: PageServerLoad = async (event) => {
    const campusesRes = await getAllCampuses(event);
    console.log('campusesRes: ', campusesRes?.data?.data?.data);

    return {
        campuses: campusesRes?.data?.data?.data ?? [],
    };
};

export const actions: Actions = {
    delete: async (event) => {
        const { params } = event;

        const deleteStaffRes = await deleteStaff(event, params.id as string);
        if (deleteStaffRes?.status === 200) {
            throw redirect(
                303,
                '/app/admin/manage-staff'
            );
        }
        return fail(400, {
            message: deleteStaffRes?.data?.detail,
            errors: deleteStaffRes?.data?.errors
        });
    },
};