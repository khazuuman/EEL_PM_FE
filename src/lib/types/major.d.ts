export interface Major {
    majorId: number;
    majorCode: string;
    majorName: string;
    majorDescription: string | null;
    isActive: boolean;
    studentCount: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}
