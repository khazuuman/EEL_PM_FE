import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const { user } = locals;


    if (!user?.roleName.includes('Mentor')) {
        throw error(403, {
            message: 'Access Denied!'
        });
    }
    return { user };
};
