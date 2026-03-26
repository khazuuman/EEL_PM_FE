export enum GroupStatusEnum {
    DRAFT = 'Draft',
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    DISBANDED = 'Disbanded'
}

export const GroupStatusTable = [
    {
        label: "Draft",
        value: "Draft",
        variant: "outline",
    },
    {
        label: "Pending",
        value: "Pending",
        variant: "outline",
    },
    {
        label: "Approved",
        value: "Approved",
        variant: "active",
    },
    {
        label: "Rejected",
        value: "Rejected",
        variant: "destructive",
    },
    {
        label: "Active",
        value: "Active",
        variant: "active",
    },
    {
        label: "Completed",
        value: "Completed",
        variant: "active",
    },
    {
        label: "Disbanded",
        value: "Disbanded",
        variant: "destructive",
    }
]