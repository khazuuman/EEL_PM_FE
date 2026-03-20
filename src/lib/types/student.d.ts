export interface CreateStudent {
    studentCode: string;
    fullName: string;
    gender: string;
    email: string;
    dateOfBirth: date | null;
    phoneNumber: string | null;
    campusId: number;
    majorId: number;
    classId: number;
    enrollmentYear: number | null;
    currentSemester: number | null;
}

export interface UpdateStudent {
    fullName: string;
    gender: string;
    dateOfBirth: date | null;
    phoneNumber: string | null;
    campusId: number;
    majorId: number;
    classId: number;
    enrollmentYear: number | null;
    currentSemester: number | null;
}