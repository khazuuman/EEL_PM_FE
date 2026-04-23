import { APP_STAFF_MANAGE_TOPIC } from "$lib/constants/depend";
import { getTopics } from "$lib/server/topics";
import type { PageServerLoad } from "./$types";
import { getAllClasses } from "$lib/server/classes";
import { getAllSemesters } from "$lib/server/semesters";
import { getAllCourses } from "$lib/server/course";

export const load: PageServerLoad = async (event) => {
    const { depends } = event;
    depends(APP_STAFF_MANAGE_TOPIC);

    const [topicsRes, classesRes, semestersRes, coursesRes] = await Promise.all([
        getTopics(event),
        getAllClasses(event),
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
    const semesters = [
        { label: "All", value: "", variant: "primary" },
        ...semestersRes?.data?.data?.data.map((s: any) => ({
            label: s.semesterName,
            value: String(s.semesterId),
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
        courses
    };
};