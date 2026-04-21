import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getLecturerById } from '$lib/server/lecturers';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const lecturerResult = await getLecturerById(event, id);
	console.log("lecturer detail: ", lecturerResult.data.data);
	if (lecturerResult.status !== 200) {
		throw error(404, {
			message: 'Not found lecturer!'
		});
	}
	return {
		lecturerDetails: lecturerResult.data.data
	};
};
