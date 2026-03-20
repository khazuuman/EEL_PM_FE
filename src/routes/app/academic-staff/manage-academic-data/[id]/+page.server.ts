import { deleteCampus } from "$lib/server/campuses";
import { deleteStudent, updateStudent } from "$lib/server/students";
import type { UpdateStudent } from "$lib/types/student";
import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
    updateStudent: async (event) => {
        const formData = await event.request.formData();
        const dateOfBirthRaw = formData.get("dateOfBirth") as string;
        const id = formData.get("studentId");
        // Build typed payload trực tiếp
        const payload: UpdateStudent = {
            fullName: formData.get("fullName") as string,
            gender: formData.get("gender") as string,
            phoneNumber: formData.get("phoneNumber") as string || null,
            dateOfBirth: dateOfBirthRaw
                ? new Date(dateOfBirthRaw).toISOString()
                : null,
            campusId: Number(formData.get("campusId")),
            majorId: Number(formData.get("majorId")),
            classId: Number(formData.get("classId")),
            enrollmentYear: formData.get("enrollmentYear")
                ? Number(formData.get("enrollmentYear"))
                : null,
            currentSemester: formData.get("currentSemester")
                ? Number(formData.get("currentSemester"))
                : null,
        };

        console.log("payload: ", payload);

        const res = await updateStudent(event, payload, id);
        console.log("updateStudentRes:", res);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to update student",
            });
        }

        return { success: true };
    },
    delete: async (event) => {
        const { url, params } = event;
        const redirectTo = url.searchParams.get('redirectTo');

        const deleteStudentRes = await deleteStudent(event, params.id);
        if (deleteStudentRes?.status === 200) {
            throw redirect(
                303,
                redirectTo ? decodeURIComponent(redirectTo) : '/app/academic-staff/manage-academic-data'
            );
        }
        return fail(400, {
            message: deleteStudentRes?.data?.detail,
            errors: deleteStudentRes?.data?.errors
        });
    },
};