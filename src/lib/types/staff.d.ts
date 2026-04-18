export interface CreateStaff {
    fullName: string;
    email: string;
    gender: string;
    campusId: number | null;
}

export interface UpdateStaff {
    fullName: string;
    email: string;
    gender: string;
    campusId: number | null;
    isActive: boolean;
}