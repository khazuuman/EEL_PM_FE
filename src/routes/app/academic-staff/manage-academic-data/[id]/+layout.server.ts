// import { error } from '@sveltejs/kit';
// import type { LayoutServerLoad } from './$types';
// import { getStudentDetail } from '$lib/server/students';
// import { getAllMajors } from '$lib/server/majors';
// import { getAllCampuses } from '$lib/server/campuses';
// import { getAllClasses } from '$lib/server/classes';

// export const load: LayoutServerLoad = async (event) => {
// 	const { params } = event;
// 	const { id } = params;
// 	const [majorsRes, campusesRes, classesRes, studentRes] = await Promise.all([
// 		getAllMajors(event),
// 		getAllCampuses(event),
// 		getAllClasses(event),
// 		getStudentDetail(event, id)
// 	]);
// 	console.log("student detail: ", studentRes.data.data);
// 	if (studentRes.status !== 200) {
// 		throw error(404, {
// 			message: 'Not found student!'
// 		});
// 	}
// 	return {
// 		majors: majorsRes?.data?.data?.data ?? [],
// 		campuses: campusesRes?.data?.data?.data ?? [],
// 		classes: classesRes?.data?.data?.data ?? [],
// 		student: studentRes.data.data
// 	};
// };

import { getStudentDetail } from "$lib/server/students";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event: any) => {
	const { params } = event;
	const { id } = params;
	// const segments = url.pathname.split("/");
	// const classIndex = segments.indexOf("class");
	// const classId = segments[classIndex + 1];
	const studentRes: any = await getStudentDetail(event, id);
	console.log("studentRes: ", studentRes?.data?.data);
	if (!studentRes || studentRes.status != 200) {
		return fail(404, "Not found student");
	}
	return {
		// classId: classId,
		student: studentRes?.data?.data
	};
};