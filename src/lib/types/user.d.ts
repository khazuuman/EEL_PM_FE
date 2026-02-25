export type User = {
	userId: string;
	fullName: string;
	username: string;
	password?: string;
	email: string;
	phoneNumber: string | null;
	candidateCode: string | null;
	class: string | null;
	status: number;
	lastLogin?: string;
	createdAt: string;
	updatedAt: string;
	roles: string[];
	permissions: string[];
	testCount?: number;
};
