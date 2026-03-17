import type { Actions } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import { loginByFEID } from "$lib/server/auth/index.js";
import type { LoginFEIDRequest } from "$lib/types/request/loginRequest"
import { error } from "@sveltejs/kit";

export const actions: Actions = {
    loginFEID: async (event) => {
        const { url } = event;
        const redirectTo = url.searchParams.get('redirectTo');
        const formData = await event.request.formData();
        const email = formData.get("email");
        const password = formData.get("password");

        if (!email)
            return fail(400, { message: "Email is required" });
        if (!password)
            return fail(400, { message: "Password is required" });

        const loginResponse = await loginByFEID(event, { email, password } as LoginFEIDRequest);
        console.log("login res: ", loginResponse);
        if (loginResponse?.status === 200) {
            throw redirect(303, redirectTo ? decodeURIComponent(redirectTo) : '/');
        }
        return fail(400, { message: loginResponse?.data?.message || 'Internal Server Error' });
    },
};
