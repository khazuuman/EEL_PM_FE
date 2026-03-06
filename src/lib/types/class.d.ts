export interface ClassDetail {
    classId: number;
    classCode: string;
    className: string;
    status: "Active" | "Inactive" | "Completed"; // mở rộng nếu có thêm status
    maxStudents: number;
    currentStudentCount: number;
    avatarUrl: string | null;
    googleMeetLink: string | null;
    semesterId: number;
    semesterName: string;
    semesterCode: string;
    campusId: number;
    campusName: string;
    courseId: number;
    courseName: string;
    lecturerId: number;
    lecturerName: string;
    groupFormationStartDate: string | null;
    groupFormationEndDate: string | null;
    topicRegistrationStartDate: string | null;
    topicRegistrationEndDate: string | null;
    createdAt: string;
    updatedAt: string;
}
