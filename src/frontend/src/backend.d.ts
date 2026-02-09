import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AlumniProfile {
    bio: string;
    contactInfo?: string;
    currentCountry: string;
    fullName: string;
    graduationYear: number;
    currentCity: string;
    department: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface EditableEvent {
    title: string;
    description: string;
    location: string;
    timestampNanos: bigint;
}
export interface Event {
    id: bigint;
    title: string;
    description: string;
    location: string;
    timestampNanos: bigint;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    timestampNanos: bigint;
}
export interface EditableAnnouncement {
    title: string;
    content: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnnouncement(announcement: EditableAnnouncement): Promise<void>;
    createEvent(event: EditableEvent): Promise<void>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteEvent(id: bigint): Promise<void>;
    getAlumniProfile(user: Principal): Promise<AlumniProfile | null>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getAnnouncementsByYearRange(startYear: number | null, endYear: number | null): Promise<Array<Announcement>>;
    getCallerUserProfile(): Promise<AlumniProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepartments(): Promise<Array<string>>;
    getEvents(byPast: boolean | null): Promise<Array<Event>>;
    getGraduationYears(): Promise<Uint16Array>;
    getUserProfile(user: Principal): Promise<AlumniProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveAlumniProfile(profile: AlumniProfile): Promise<void>;
    saveCallerUserProfile(profile: AlumniProfile): Promise<void>;
    searchAlumniProfiles(filterYear: number | null, filterDepartment: string | null): Promise<Array<AlumniProfile>>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateEvent(id: bigint, updatedEvent: EditableEvent): Promise<void>;
}
