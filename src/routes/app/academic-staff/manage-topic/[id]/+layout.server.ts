import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getTopicById } from '$lib/server/topics';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const topicResult = await getTopicById(event, id);
	console.log("topic detail: ", topicResult.data.data);
	if (topicResult.status !== 200) {
		throw error(404, {
			message: 'Not found topic!'
		});
	}
	return {
		courseDetails: topicResult.data.data
	};
};
