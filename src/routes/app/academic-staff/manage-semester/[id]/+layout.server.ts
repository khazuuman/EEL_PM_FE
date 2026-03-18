import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSemesterDetail } from '$lib/server/semesters';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const semesterResult = await getSemesterDetail(event, id);
	console.log("semester detail: ", semesterResult.data.data);
	if (semesterResult.status !== 200) {
		throw error(404, {
			message: 'Not found course!'
		});
	}
	return {
		semester: semesterResult.data.data
	};
};
