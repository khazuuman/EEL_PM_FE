export interface CreateTopic {
    groupId: int;
    title: string;
    description: string;
    objectives: string;
    logoUrl: string;
}

export interface UpdateTopic {
    title: string;
    description: string;
    objectives: string;
    logoUrl: string;
}
