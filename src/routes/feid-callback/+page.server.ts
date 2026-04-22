// src/routes/feid-callback/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";
import { exchangeCodeForToken } from "$lib/server/auth/index.js";

export const load: PageServerLoad = async (event) => {
    const { url } = event;
    const code = url.searchParams.get("code");

    if (!code) {
        throw error(400, { message: "Missing authorization code" });
    }

    const tokenRes = await exchangeCodeForToken(event, { code });
    console.log('tokenRes: ', tokenRes.data);

    if (tokenRes.status !== 200) {
        throw error(401, { message: tokenRes.data?.message ?? "Authentication failed" });
    }

    throw redirect(303, "/");
};