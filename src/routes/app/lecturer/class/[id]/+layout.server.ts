import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
    const classId = params.id;
    console.log("class ID: ", classId);
    
    return { classId };
};
