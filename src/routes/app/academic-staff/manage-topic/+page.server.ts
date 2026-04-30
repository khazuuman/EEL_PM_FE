import { APP_STAFF_MANAGE_TOPIC } from "$lib/constants/depend";
import { getTopics } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";
import { getAllClasses } from "$lib/server/classes";
import { getAllSemesters } from "$lib/server/semesters";
import { getAllCourses } from "$lib/server/course";

export const load: PageServerLoad = async (event) => {
    const { depends, url } = event;
    depends(APP_STAFF_MANAGE_TOPIC);
    //url default
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

    const [topicsRes, classesRes, coursesRes] = await Promise.all([
        getTopics(event),
        getAllClasses(event, currentSemesterId),
        getAllSemesters(event),
        getAllCourses(event)
    ]);

    // Flatten topics thành 1 cấp
    const topics = (topicsRes?.data?.data?.data ?? []).map((t: any) => ({
        topicId: t.topicId,
        title: t.title,
        status: t.status,
        groupName: t.group?.groupName ?? null,
        classCode: t.group?.classCode ?? null,
    }));

    const classes = [
        { label: "All", value: "", variant: "primary" },
        ...classesRes?.data?.data?.data.map((c: any) => ({
            label: c.className,
            value: String(c.classId),
            variant: "primary",
        })),
    ];

    const courses = [
        { label: "All", value: "", variant: "primary" },
        ...coursesRes?.data?.data?.data.map((s: any) => ({
            label: s.courseCode,
            value: String(s.courseId),
            variant: "primary",
        })),
    ];
    return {
        topics,
        pageSize: topicsRes?.data?.data?.pagination?.limit ?? 0,
        totalCount: topicsRes?.data?.data?.pagination?.totalItems ?? 0,
        classes,
        semesters,
        courses,
        currentSemesterId: currentSemesterId ?? "",
    };
};