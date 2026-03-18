export interface CreateCourse {
    courseCode: string;
    courseName: string;
    courseDescription: string;
    credits: number;
    isActive: boolean;
}

export interface UpdateCourse {
    courseName: string;
    courseDescription: string;
    credits: number;
    isActive: boolean;
}