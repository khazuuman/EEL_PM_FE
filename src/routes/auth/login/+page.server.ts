import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        // const campus = formData.get("campus") as string;

        // if (!campus) return { error: "Please select a campus" };

        // Lưu campus vào cookie trước khi redirect
        // cookies.set("selectedCampus", campus, {
        //     path: "/",
        //     maxAge: 300, // 5 phút
        //     httpOnly: true,
        //     sameSite: "lax",
        // });

        // Redirect sang Google OAuth
        redirect(302, "/auth/google");
    },
};
