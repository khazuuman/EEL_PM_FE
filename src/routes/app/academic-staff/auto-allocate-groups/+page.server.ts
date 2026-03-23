import { getAllCampuses } from "$lib/server/campuses";
import { getAllSemesters } from "$lib/server/semesters";
import type { PageServerLoad } from "./$types";
import { getClasses } from "$lib/server/classes";
import { getAllLecturers } from "$lib/server/lecturers";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { allocateGroup } from "$lib/server/classes";
import { getStudentsByClass } from "$lib/server/students";

export const load: PageServerLoad = async (event) => {
    const { url } = event;
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const [classesRes, campusesRes, semestersRes, lecturersRes] = await Promise.all([
        getClasses(event),
        getAllCampuses(event),
        getAllSemesters(event),
        getAllLecturers(event)
    ]);
    console.log("lecturers: ", lecturersRes.data?.data?.data);
    const lecturers = [
        { label: "All", value: "", variant: "primary" },
        ...lecturersRes?.data?.data?.data.map((l: any) => ({
            label: l.lecturerCode,
            value: String(l.lecturerId),
            variant: "primary",
        })),
    ];

    const campuses = [
        { label: "All", value: "", variant: "primary" },
        ...campusesRes?.data?.data?.data.map((c: any) => ({
            label: c.campusName,
            value: String(c.campusId),
            variant: "primary",
        })),
    ];

    const semesters = [
        { label: "All", value: "", variant: "primary" },
        ...semestersRes?.data?.data?.data.map((s: any) => ({
            label: s.semesterName,
            value: String(s.semesterId),
            variant: "primary",
        })),
    ];

    return {
        classes: classesRes?.data?.data?.data ?? [],
        campuses: campuses ?? [],
        semesters: semesters ?? [],
        lecturers: lecturers ?? [],
        pageSize: classesRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: classesRes?.data?.data?.pagination?.totalItems ?? 0
    };
};

export const actions: Actions = {
    autoAllocate: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");
        const groupCount = Number(formData.get("groupCount"));
        const memberCount = Number(formData.get("memberCount"));

        const allocateGroupRes = await allocateGroup(event, { groupCount, memberCount }, classId);
        console.log("allocateGroupRes res: ", allocateGroupRes);
        if (!allocateGroupRes || allocateGroupRes.status !== 200) {
            return fail(400, {
                message: allocateGroupRes?.data?.message ?? "Failed to allocate group",
            });
        }

        return {
            success: true,
            message: allocateGroupRes?.data?.message ?? null,
        };
    },
    getStudentsByClass: async (event) => {
        const formData = await event.request.formData();
        const classId = formData.get("classId");

        const studentByClassRes = await getStudentsByClass(event, classId);
        console.log("allocateGroupRes res: ", studentByClassRes);
        if (!studentByClassRes || studentByClassRes.status !== 200) {
            return fail(400, {
                message: studentByClassRes?.data?.message ?? "Failed to get class",
            });
        }

        return {
            success: true,
            message: studentByClassRes?.data?.message ?? null,
        };
    },
};
