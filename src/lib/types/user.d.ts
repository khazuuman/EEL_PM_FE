import type ROLE from "$lib/enums/role";

// ── UserProfile ───────────────────────────────────────────────────
export interface UserProfileDto {
	userId: number;
	email: string;
	fullName: string;
	avatarUrl?: string; 
	phoneNumber?: string;
	roles: ROLE[];
	lastLoginAt?: string; // DateTime → ISO string

	// Chỉ 1 trong các field dưới có giá trị tùy theo role
	student?: StudentProfileDto;
	lecturer?: LecturerProfileDto;
	mentor?: MentorProfileDto;
	academicStaff?: AcademicStaffProfileDto;
	admin?: AdminProfileDto;
}

// ── Student ───────────────────────────────────────────────────────
export interface StudentProfileDto {
	studentId: number;
	studentCode: string;
	fullName: string;
	gender?: string;
	dateOfBirth?: string;
	phoneNumber?: string;
	avatarUrl?: string;
	enrollmentYear: number;
	currentSemester?: number;
	createdBy?: number;
	updatedBy?: number;
	createdAt: string;
	updatedAt: string;

	campusId: number;
	campusName: string;

	majorId: number;
	majorCode: string;
	majorName: string;

	classId: number;
	classCode: string;
	className: string;
}

// ── Lecturer ──────────────────────────────────────────────────────
export interface LecturerProfileDto {
	lecturerId: number;
	lecturerCode: string;
	fullName: string;
	gender?: string;
	phoneNumber?: string;
	avatarUrl?: string;
	teachingSpecialization?: string;
	department?: string;
	createdBy?: number;
	updatedBy?: number;
	createdAt: string;
	updatedAt: string;

	campusId: number;
	campusName: string;
}

// ── Mentor ────────────────────────────────────────────────────────
export interface MentorProfileDto {
	mentorId: number;
	mentorCode?: string;
	fullName: string;
	phoneNumber?: string;
	avatarUrl?: string;
	currentCompany?: string;
	currentPosition?: string;
	fieldOfWork?: string;
	biography?: string;
	yearsOfExperience?: number;
	isActive: boolean;
	createdBy?: number;
	updatedBy?: number;
	createdAt: string;
	updatedAt: string;
}

// ── AcademicStaff ─────────────────────────────────────────────────
export interface AcademicStaffProfileDto {
	staffId: number;
	staffCode: string;
	fullName: string;
	gender?: string;
	phoneNumber?: string;
	avatarUrl?: string;
	department?: string;
	position?: string;
	createdBy?: number;
	updatedBy?: number;
	createdAt: string;
	updatedAt: string;

	campusId: number;
	campusName: string;
}

// ── Admin ─────────────────────────────────────────────────────────
export interface AdminProfileDto {
	adminId: number;
	adminCode: string;
	fullName: string;
	phoneNumber?: string;
	avatarUrl?: string;
	department?: string;
	createdBy?: number;
	updatedBy?: number;
	createdAt: string;
	updatedAt: string;
}

// ── UpdateProfileRequest ──────────────────────────────────────────
export interface UpdateProfileRequestDto {
	phoneNumber?: string;
	gender?: 'Male' | 'Female' | 'Other';
	dateOfBirth?: string;

	// Mentor only
	currentCompany?: string;
	currentPosition?: string;
	fieldOfWork?: string;
	biography?: string;
	yearsOfExperience?: number;
}
