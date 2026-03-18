import { deleteCampus, updateCampus } from "$lib/server/campuses";
import { deleteCourse, updateCourse } from "$lib/server/course";
import type { CreateCampus } from "$lib/types/campus";
import type { UpdateCourse } from "$lib/types/course";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    updateCampus: async (event) => {
        const { params } = event;
        const formData = await event.request.formData();
        const campusCode = formData.get("campusCode") as string;
        const campusName = formData.get("campusName") as string;
        const city = formData.get("city") as string;
        const address = formData.get("address") as string;
        const isActive = formData.get("isActive") === "true";

        const body: CreateCampus = {
            campusCode,
            campusName,
            city,
            address,
            isActive
        }

        console.log("update campus body: ", body);

        const updateCampusRes = await updateCampus(event, body, params.id as string);
        console.log("update campus:", updateCampusRes);

        if (!updateCampusRes || updateCampusRes.status !== 200) {
            return fail(400, {
                message: updateCampusRes?.data?.message ?? "Failed to update campus",
            });
        }

        return {
            success: true,
            group: updateCampusRes?.data?.message ?? null,
        };
    },
    delete: async (event) => {
        const { url, params } = event;
        const redirectTo = url.searchParams.get('redirectTo');

        const deleteCampusRes = await deleteCampus(event, params.id as string);
        if (deleteCampusRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-campuses'
            );
        }
        return fail(400, {
            message: deleteCampusRes?.data?.detail,
            errors: deleteCampusRes?.data?.errors
        });
    },
};