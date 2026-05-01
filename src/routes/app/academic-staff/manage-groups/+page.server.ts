import { APP_STAFF_MANAGE_GROUP } from "$lib/constants/depend";
import { getAllClasses } from "$lib/server/classes";
import type { PageServerLoad } from "./$types";
import { getGroups } from "$lib/server/groups";
import { getAllSemesters } from "$lib/server/semesters";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_GROUP);
    if (!url.searchParams.has("page")) url.searchParams.set("page", "1");
    if (!url.searchParams.has("limit")) url.searchParams.set("limit", "10");
    const semesterRes = await getAllSemesters(event);
    let currentSemesterId;
    const semesters = (semesterRes?.data?.data?.data ?? [])
        .map((c: any) => ({
            label: c.semesterName,
            value: String(c.semesterId),
            variant: "primary",
            isCurrent: c.isCurrent,
        }))
        .sort((a: any, b: any) => {
            if (a.isCurrent) {
                currentSemesterId = a.value;
                return -1;
            }
            if (b.isCurrent) return 1;
            return 0;
        });

    const selectedSemesterId = url.searchParams.get("semesterId") ?? currentSemesterId;

    const [groupsRes, classesRes] = await Promise.all([
        getGroups(event),
        getAllClasses(event, selectedSemesterId),
    ]);

    const classes = [
        { label: "All", value: "", variant: "primary" },
        ...classesRes?.data?.data?.data.map((c: any) => ({
            label: c.className,
            value: String(c.classId),
            variant: "primary",
        })),
    ];

    return {
        groups: groupsRes?.data?.data?.data ?? [],
        classes: classes ?? [],
        semesters: semesters ?? [],
        pageSize: groupsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: groupsRes?.data?.data?.pagination?.totalItems ?? 0,
        currentSemesterId: currentSemesterId ?? "",
        // filters: {
        //     searchTerm: url.searchParams.get("searchTerm"),
        //     classId: url.searchParams.get("classId"),
        //     semesterId: url.searchParams.get("semesterId"),
        // }
    };
};