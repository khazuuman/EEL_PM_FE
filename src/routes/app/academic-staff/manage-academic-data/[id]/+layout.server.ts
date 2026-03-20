import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getStudentDetail } from '$lib/server/students';
import { getAllMajors } from '$lib/server/majors';
import { getAllCampuses } from '$lib/server/campuses';
import { getAllClasses } from '$lib/server/classes';

export const load: LayoutServerLoad = async (event) => {
	const { params } = event;
	const { id } = params;
	const [majorsRes, campusesRes, classesRes, studentRes] = await Promise.all([
		getAllMajors(event),
		getAllCampuses(event),
		getAllClasses(event),
		getStudentDetail(event, id)
	]);
	console.log("student detail: ", studentRes.data.data);
	if (studentRes.status !== 200) {
		throw error(404, {
			message: 'Not found student!'
		});
	}
	return {
		majors: majorsRes?.data?.data?.data ?? [],
		campuses: campusesRes?.data?.data?.data ?? [],
		classes: classesRes?.data?.data?.data ?? [],
		student: studentRes.data.data
	};
};
