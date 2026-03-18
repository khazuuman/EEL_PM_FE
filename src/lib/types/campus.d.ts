export interface Campus {
    campusId: number;
    campusCode: string;
    campusName: string;
    city: string;
    address: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCampus {
    campusCode: string;
    campusName: string;
    city: string;
    address: string;
    isActive: boolean;
}
