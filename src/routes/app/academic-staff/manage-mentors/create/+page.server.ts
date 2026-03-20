
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import type { CreateMentor } from "$lib/types/mentor";
import { createMentor } from "$lib/server/mentor";

export const actions: Actions = {
    createMentor: async (event) => {
        const formData = await event.request.formData();
        // Build typed payload trực tiếp
        const payload: CreateMentor = {
            mentorCode: formData.get("mentorCode") as string,
            fullName: formData.get("fullName") as string,
            phoneNumber: formData.get("phoneNumber") as string,
            currentCompany: formData.get("currentCompany") as string,
            email: formData.get("email") as string,
            currentPosition: formData.get("currentPosition") as string,
            fieldOfWork: formData.get("fieldOfWork") as string,
            biography: formData.get("biography") as string,
            yearsOfExperience: Number(formData.get("yearsOfExperience")),
            isActive: true,
        };

        console.log("payload: ", payload);

        const res = await createMentor(event, payload);
        console.log("createMentorRes:", res);

        if (!res || res.status !== 200) {
            return fail(400, {
                message: res?.data?.message ?? "Failed to create mentor",
            });
        }

        return { success: true };
    },
};