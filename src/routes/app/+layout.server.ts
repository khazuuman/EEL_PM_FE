// src/routes/(dashboard)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getMe } from '$lib/server/auth';

export const load: LayoutServerLoad = async (event) => {

    const result = await getMe(event);

    if (result.status !== 200) {
        redirect(302, '/auth/login?toast=error&message=Session expired');
    }

    return {
        user: result.data.data 
    };
};
