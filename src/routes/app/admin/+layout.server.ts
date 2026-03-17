import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const { user } = locals;


    if (!user?.roles.includes('Admin')) {
        throw error(403, {
            message: 'Access Denied!'
        });
    }
    return { user };
};
