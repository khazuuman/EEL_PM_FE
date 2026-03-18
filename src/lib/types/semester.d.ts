export interface Semester {
    semesterId: number;
    semesterCode: string;
    semesterName: string;
    year: number;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSemester {
    semesterCode: string;
    semesterName: string;
    year: number;
    startDate: string;
    endDate: string;
}

export interface UpdateSemester {
    semesterName: string;
    year: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}