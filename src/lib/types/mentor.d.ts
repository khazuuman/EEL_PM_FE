export interface CreateMentor {
    email: string;
    mentorCode: string;
    fullName: string;
    phoneNumber: string | null;
    currentCompany: string | null;
    currentPosition: string | null;
    fieldOfWork: string | null;
    biography: string | null;
    yearsOfExperience: number | null;
    isActive: boolean;
}

export interface UpdateMentor {
    fullName: string;
    phoneNumber: string | null;
    currentCompany: string | null;
    currentPosition: string | null;
    fieldOfWork: string | null;
    biography: string | null;
    yearsOfExperience: number | null;
    isActive: boolean;
}
