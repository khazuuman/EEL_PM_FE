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