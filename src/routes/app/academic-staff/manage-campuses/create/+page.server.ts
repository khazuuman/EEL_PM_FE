import { createCampus } from "$lib/server/campuses";
import type { CreateCampus } from "$lib/types/campus";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    createCampus: async (event) => {
        const formData = await event.request.formData();
        const campusCode = formData.get("campusCode") as string;
        const campusName = formData.get("campusName") as string;
        const city = formData.get("city") as string;
        const address = formData.get("address") as string;
        const isActive = formData.get("isActive") === "true";

        const createCampusRes = await createCampus(event, {
            campusCode,
            campusName,
            city,
            address,
            isActive
        } as CreateCampus);
        console.log("createCampusRes:", createCampusRes);

        if (!createCampusRes || createCampusRes.status !== 201) {
            return fail(400, {
                message: createCampusRes?.data?.message ?? "Failed to create campus",
            });
        }

        return {
            success: true,
            group: createCampusRes?.data?.message ?? null,
        };
    },
};