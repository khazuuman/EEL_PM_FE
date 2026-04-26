import { APP_STAFF_MANAGE_STUDENT } from "$lib/constants/depend";
import { getAllCampuses } from "$lib/server/campuses";
import { getAllClasses } from "$lib/server/classes";
import { getAllMajors } from "$lib/server/majors";
import { getAllSemesters } from "$lib/server/semesters";
import { getStudents } from "$lib/server/students";
import { importAcademicData } from "$lib/server/import";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { dataSynchronization } from "$lib/server/synchronization";
import { getAllCourses } from "$lib/server/course";

// export const load: PageServerLoad = async (event) => {
//     const { depends, url } = event;
//     depends(APP_STAFF_MANAGE_STUDENT);
//     if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
//     if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
//     const [studentsRes, majorsRes, campusesRes, classesRes, semestersRes] = await Promise.all([
//         getStudents(event),
//         getAllMajors(event),
//         getAllCampuses(event),
//         getAllClasses(event),
//         getAllSemesters(event)
//     ]);
//     const majors = [
//         { label: "All", value: "", variant: "primary" },
//         ...majorsRes?.data?.data?.data.map((m: any) => ({
//             label: m.majorName,
//             value: String(m.majorId),
//             variant: "primary",
//         })),
//     ];

//     const campuses = [
//         { label: "All", value: "", variant: "primary" },
//         ...campusesRes?.data?.data?.data.map((c: any) => ({
//             label: c.campusName,
//             value: String(c.campusId),
//             variant: "primary",
//         })),
//     ];

//     const classes = [
//         { label: "All", value: "", variant: "primary" },
//         ...classesRes?.data?.data?.data.map((c: any) => ({
//             label: c.className,
//             value: String(c.classId),
//             variant: "primary",
//         })),
//     ];

//     const semesters = [
//         { label: "All", value: "", variant: "primary" },
//         ...semestersRes?.data?.data?.data.map((s: any) => ({
//             label: s.semesterName,
//             value: String(s.semesterId),
//             variant: "primary",
//         })),
//     ];

//     return {
//         students: studentsRes?.data?.data?.data ?? [],
//         majors: majors ?? [],
//         campuses: campuses ?? [],
//         classes: classes ?? [],
//         semesters: semesters ?? [],
//         pageSize: studentsRes?.data?.data?.pagination?.limit ?? 0,
//         totalCount: studentsRes?.data?.data?.pagination?.totalItems ?? 0
//     };
// };

export const actions: Actions = {
    // importAcademicData: async (event) => {
    //     const formData = await event.request.formData();
    //     const semesterId = formData.get("semesterId");
    //     const campusId = formData.get("campusId");

    //     const importRes = await importAcademicData(event, semesterId, campusId, formData);
    //     console.log("import res: ", importRes);
    //     if (!importRes || importRes.status !== 200) {
    //         return fail(400, {
    //             message: importRes?.data?.message ?? "Failed to import",
    //         });
    //     }

    //     return {
    //         success: true,
    //         message: importRes?.data?.message ?? null,
    //     };
    // },
    syncData: async (event) => {
        const formData = await event.request.formData();
        const prevCourseId = formData.get("prevCourseId");
        const currentCourseId = formData.get("currentCourseId");

        const syncRes = await dataSynchronization(event, { prevCourseId, currentCourseId });
        console.log("syncRes: ", syncRes);
        if (!syncRes || syncRes.status !== 200) {
            return fail(400, {
                message: syncRes?.data?.message ?? "Failed to sync data",
            });
        }

        return {
            success: true,
            message: syncRes?.data?.message ?? null,
        };
    },
    getAllCourses: async (event) => {
        const coursesRes = await getAllCourses(event);
        console.log("coursesRes: ", coursesRes);

        return {
            success: true,
            courses: coursesRes?.data?.data?.data ?? [],
        };
    },
};
