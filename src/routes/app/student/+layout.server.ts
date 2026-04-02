import { error } from '@sveltejs/kit';

export const load = async (event) => {
    const { parent } = event;
    const { user } = await parent();

    console.log("user in layout: ", user);

    if (!user?.roles.includes('Student')) {
        throw error(403, {
            message: 'Access Denied!'
        });
    }
    return {
        user: user,
    };
};
