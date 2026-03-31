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

export interface ReviewTopic {
    status: string;
    reviewFeedback: string;
}

export interface ChangeTopic {
    newTitle: string;
    newDescription: string;
    newObjectives: string;
    newLogoUrl: string;
}