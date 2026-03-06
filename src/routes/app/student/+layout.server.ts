import { error } from '@sveltejs/kit';

export const load = async (event) => {
    const { parent } = event;
    const { user } = await parent();

    if (!user?.roleName.includes('Student')) {
        throw error(403, {
            message: 'Access Denied!'
        });
    }
    return {
        user: user
    };
};
