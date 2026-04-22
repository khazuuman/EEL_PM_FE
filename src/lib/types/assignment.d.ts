export interface CreateAssignment {
    title: string;
    type: string | null;
    gradeItemId: number | null;
    description: string | null;
    dueDate: date;
    maxScore: number;
    files: string[] | null;
    status: string | null;
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