export interface CreateCourse {
    courseCode: string;
    courseName: string;
    courseLevel: number;
    courseDescription: string;
    credits: number;
    isActive: boolean;
}

export interface UpdateCourse {
    courseName: string;
    courseLevel: number;
    courseDescription: string;
    credits: number;
    isActive: boolean;
}