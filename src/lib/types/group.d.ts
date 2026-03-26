export interface CreateGroup {
    // name: string;
    // description: string | null | undefined;
    // campusId: number;
    classId: number;
    studentIds: number[];
}

export interface UpdateGroup {
    studentIds: number[];
}