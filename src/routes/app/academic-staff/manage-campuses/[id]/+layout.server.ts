import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getCampuseDetail } from '$lib/server/campuses';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const campusResult = await getCampuseDetail(event, id);
	console.log("course detail: ", campusResult.data.data);
	if (campusResult.status !== 200) {
		throw error(404, {
			message: 'Not found campus!'
		});
	}
	return {
		campusDetails: campusResult.data.data
	};
};
