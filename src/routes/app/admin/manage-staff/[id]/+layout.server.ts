import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getStaffById } from '$lib/server/staff';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const staffResult = await getStaffById(event, id);
	console.log("staff detail: ", staffResult.data.data);
	if (staffResult.status !== 200) {
		throw error(404, {
			message: 'Not found staff!'
		});
	}
	return {
		staffDetails: staffResult.data.data
	};
};
