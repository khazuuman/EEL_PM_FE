import { APP_STAFF_MANAGE_GROUP } from "$lib/constants/depend";
import { getAllClasses } from "$lib/server/classes";
import type { PageServerLoad } from "./$types";
import { getGroups } from "$lib/server/groups";
import { getAllSemesters } from "$lib/server/semesters";
import { getAllCampuses } from "$lib/server/campuses";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_GROUP);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const [groupsRes, classesRes, semesterRes, campusesRes] = await Promise.all([
        getGroups(event),
        getAllClasses(event),
        getAllSemesters(event),
        getAllCampuses(event)
    ]);

    const classes = [
        { label: "All", value: "", variant: "primary" },
        ...classesRes?.data?.data?.data.map((c: any) => ({
            label: c.className,
            value: String(c.classId),
            variant: "primary",
        })),
    ];

    const semesters = [
        { label: "All", value: "", variant: "primary" },
        ...semesterRes?.data?.data?.data.map((c: any) => ({
            label: c.semesterName,
            value: String(c.semesterId),
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

    console.log('groupsRes: ', groupsRes?.data?.data?.data);

    return {
        groups: groupsRes?.data?.data?.data ?? [],
        classes: classes ?? [],
        semesters: semesters ?? [],
        campuses: campuses ?? [],
        pageSize: groupsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: groupsRes?.data?.data?.pagination?.totalItems ?? 0
    };
};