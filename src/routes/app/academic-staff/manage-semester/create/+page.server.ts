import { createSemester } from "$lib/server/semesters";
import type { CreateSemester } from "$lib/types/semester";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
    createSemester: async (event) => {
        const formData = await event.request.formData();
        const semesterCode = formData.get("semesterCode") as string;
        const semesterName = formData.get("semesterName") as string;
        const year = Number(formData.get("year"));
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;

        const createSemesterRes = await createSemester(event, {
            semesterCode,
            semesterName,
            year,
            startDate,
            endDate
        } as CreateSemester);
        console.log("createSemesterRes:", createSemesterRes);

        if (!createSemesterRes || createSemesterRes.status !== 201) {
            return fail(400, {
                message: createSemesterRes?.data?.message ?? "Failed to create semester",
            });
        }

        return {
            success: true,
            group: createSemesterRes?.data?.message ?? null,
        };
    },
};