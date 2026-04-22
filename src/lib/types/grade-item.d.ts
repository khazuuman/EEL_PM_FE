export interface CreateGradeItem {
    courseId: number;
    name: string;
    weight: number;
}

export interface UpdateGradeItem {
    name: string;
    weight: number;
}