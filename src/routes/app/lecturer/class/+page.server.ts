import { APP_CLASSES_LECTURER } from "$lib/constants/depend";
import { getClassesForLecturer } from "$lib/server/classes";
import { getSemesters } from "$lib/server/semesters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const { depends, locals } = event;
    const { user } = locals;

    depends(APP_CLASSES_LECTURER);

    //lecturer ID
    const lecturerId = user.lecturer.lecturerId;

    //semesters
    const semesterResult = await getSemesters(event);
    console.log("semesterResult: ", semesterResult);

    const classResult = await getClassesForLecturer(event, lecturerId);
    console.log("class: ", classResult);
    return {
        user: user,
        semesters: semesterResult?.data?.data?.data ?? [],
        classes: classResult?.data?.data?.data ?? [],
        pageSize: classResult?.data?.pageSize ?? 0,
        totalCount: classResult?.data?.totalCount ?? 0
    };
};