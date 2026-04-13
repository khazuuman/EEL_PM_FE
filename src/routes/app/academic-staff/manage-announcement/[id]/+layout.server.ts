import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAnnouncementDetail } from '$lib/server/announcements';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const announcementResult = await getAnnouncementDetail(event, Number(id));
	console.log("announcementResult: ", announcementResult.data.data.targets);
	if (announcementResult.status !== 200) {
		throw error(404, {
			message: 'Not found announcement!'
		});
	}
	return {
		announcement: announcementResult.data.data
	};
};
