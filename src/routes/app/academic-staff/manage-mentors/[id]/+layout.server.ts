import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getMentorDetails } from '$lib/server/mentor';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const mentorResult = await getMentorDetails(event, id);
	console.log("mentor detail: ", mentorResult.data.data);
	if (mentorResult.status !== 200) {
		throw error(404, {
			message: 'Not found campus!'
		});
	}
	return {
		mentor: mentorResult.data.data
	};
};
