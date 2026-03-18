import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getCourseDetails } from '$lib/server/course';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const courseResult = await getCourseDetails(event, id);
	console.log("course detail: ", courseResult.data.data);
	if (courseResult.status !== 200) {
		throw error(404, {
			message: 'Not found course!'
		});
	}
	return {
		courseDetails: courseResult.data.data
	};
};
