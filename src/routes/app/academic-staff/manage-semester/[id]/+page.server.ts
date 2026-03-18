import { deleteCourse, updateCourse } from "$lib/server/course";
import { deleteSemester, updateSemester } from "$lib/server/semesters";
import type { UpdateCourse } from "$lib/types/course";
import type { UpdateSemester } from "$lib/types/semester";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    updateSemester: async (event) => {
        const { params } = event;
        const formData = await event.request.formData();
        const semesterName = formData.get("semesterName") as string;
        const year = Number(formData.get("year"));
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;
        const isActive = formData.get("isActive") === "true";

        const body: UpdateSemester = {
            semesterName,
            year,
            startDate,
            endDate,
            isActive
        }

        console.log("update semester body: ", body);

        const updateSemesterRes = await updateSemester(event, body, params.id as string);
        console.log("update semester:", updateSemesterRes);

        if (!updateSemesterRes || updateSemesterRes.status !== 200) {
            return fail(400, {
                message: updateSemesterRes?.data?.message ?? "Failed to update semester",
            });
        }

        return {
            success: true,
            group: updateSemesterRes?.data?.message ?? null,
        };
    },
    delete: async (event) => {
        const { url, params } = event;
        const redirectTo = url.searchParams.get('redirectTo');

        const deleteSemesterRes = await deleteSemester(event, params.id as string);
        if (deleteSemesterRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-semester'
            );
        }
        return fail(400, {
            message: deleteSemesterRes?.data?.detail,
            errors: deleteSemesterRes?.data?.errors
        });
    },
};