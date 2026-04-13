export interface CreateAnnouncement {
    title: string;
    content: string;
    city: string;
    roleName: string[];
}

export interface UpdateAnnouncement {
    title: string;
    content: string;
    city: string;
    isActive: boolean;
    roleName: string[];
}