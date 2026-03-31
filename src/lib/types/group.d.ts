export interface CreateGroup {
    // maxMembers: number;
    // minMembers: number;
    classId: number;
    studentIds: number[];
}

export interface UpdateGroup {
    // maxMembers: number;
    // minMembers: number;
    studentIds: number[];
}

export interface AllocateGroup {
    // maxMembers: number;
    // minMembers: number;
    groupCount: number;
    // memberCount: number;
}