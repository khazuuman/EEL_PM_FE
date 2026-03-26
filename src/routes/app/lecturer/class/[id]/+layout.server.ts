import { getClassDetails } from '$lib/server/classes';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
    const { params } = event;
    const classDetails = await getClassDetails(event, params.id);
    console.log("class details: ", classDetails.data.data);

    return { classDetails: classDetails.data.data };
};
