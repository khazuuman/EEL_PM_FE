import { getAllCampuses } from "$lib/server/campuses";
import { createCampus } from "$lib/server/campuses";
import { getAllClasses } from "$lib/server/classes";
import { getAllMajors } from "$lib/server/majors";
import type { CreateCampus } from "$lib/types/campus";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { createStudent } from "$lib/server/students";
import type { CreateStudent } from "$lib/types/student";

export const load: PageServerLoad = async (event) => {
    const [majorsRes, campusesRes, classesRes] = await Promise.all([
        getAllMajors(event),
        getAllCampuses(event),
        getAllClasses(event),
    ]);

    return {
        majors: majorsRes?.data?.data?.data ?? [],
        campuses: campusesRes?.data?.data?.data ?? [],
        classes: classesRes?.data?.data?.data ?? [],
    };
};

export const actions: Actions = {
    createStudent: async (event) => {
        const formData = await event.request.formData();
        const dateOfBirthRaw = formData.get("dateOfBirth") as string;
        // Build typed payload trực tiếp
        const payload: CreateStudent = {
            studentCode: formData.get("studentCode") as string,
            fullName: formData.get("fullName") as string,
            gender: formData.get("gender") as string,
            email: formData.get("email") as string,
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

        const res = await createStudent(event, payload);
        console.log("createStudentRes:", res);

        if (!res || res.status !== 201) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to create student",
            });
        }

        return { success: true };
    },
};