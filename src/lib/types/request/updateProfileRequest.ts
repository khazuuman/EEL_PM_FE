export interface UpdateProfileRequest {
    phoneNumber?: string | null;
    gender?: number | null;
    dateOfBirth?: string | null;
    avatarUrl?: string | null;
    //mentor
    currentCompany?: string | null;
    currentPosition?: string | null;
    fieldOfWork?: string | null;
    biography?: string | null;
    yearsOfExperience?: number | null;
}