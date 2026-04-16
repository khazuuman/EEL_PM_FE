export interface CreateAssignment {
    title: string;
    type: string;
    sequenceNumber: number;
    description: string;
    dueDate: date;
    maxScore: number;
    files: string[];
    status: string;
}

export interface SubmitAssignment {
    fileUrls: string[];
    links: LinkSubmit[];
    notes: string;
}

export interface LinkSubmit {
    title: string;
    url: string;
}

export interface GradeAssignment {
    score: number;
    feedback: string;
}