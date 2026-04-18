import type { PageServerLoad } from "../$types";
import { getAllCampuses } from "$lib/server/campuses";
import type { UpdateStaff } from "$lib/types/staff";
import { updateStaff } from "$lib/server/staff";
import { fail } from "@sveltejs/kit";
import type { Actions } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
    const campusesRes = await getAllCampuses(event);
    console.log('campusesRes: ', campusesRes?.data?.data?.data);

    return {
        campuses: campusesRes?.data?.data?.data ?? [],
    };
};

export const actions: Actions = {
    updateStaff: async (event) => {
        const { params } = event;
        const formData = await event.request.formData();
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const gender = formData.get("gender") as string;
        const campusId = Number(formData.get("campusId"));
        const isActive = formData.get("isActive") === "true";

        const updateStaffRes = await updateStaff(event, params.id, {
            fullName: fullName,
            email: email,
            gender: gender,
            campusId: campusId,
            isActive: isActive
        } as UpdateStaff);
        console.log("updateStaffRes:", updateStaffRes);

        if (!updateStaffRes || updateStaffRes.status !== 200) {
            return fail(400, {
                message: updateStaffRes?.data?.message ?? "Failed to update staff",
            });
        }

        return {
            success: true,
            group: updateStaffRes?.data?.message ?? null,
        };
    },
};