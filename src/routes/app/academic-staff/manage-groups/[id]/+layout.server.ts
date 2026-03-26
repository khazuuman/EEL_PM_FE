import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getGroupDetail } from '$lib/server/groups';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const { id } = params;
    const groupResult = await getGroupDetail(event, id);
    console.log("group detail: ", groupResult.data.data);
    if (groupResult.status !== 200) {
        throw error(404, {
            message: 'Not found group!'
        });
    }
    return {
        groupDetails: groupResult.data.data
    };
};