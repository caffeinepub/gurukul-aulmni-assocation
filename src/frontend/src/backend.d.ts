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
export interface EditableActivity {
    title: string;
    description: string;
    photos: Array<string>;
}
export interface BackendStatus {
    totalActivities: bigint;
    totalAnnouncements: bigint;
    totalGalleryImages: bigint;
    totalEvents: bigint;
    totalPendingUsers: bigint;
    totalAlumniProfiles: bigint;
    totalApprovedUsers: bigint;
}
export interface BackendSnapshot {
    id: bigint;
    totalActivities: bigint;
    totalAnnouncements: bigint;
    totalGalleryImages: bigint;
    totalEvents: bigint;
    totalPendingUsers: bigint;
    totalAlumniProfiles: bigint;
    capturedAt: bigint;
    totalApprovedUsers: bigint;
}
export interface Event {
    id: bigint;
    title: string;
    description: string;
    location: string;
    timestampNanos: bigint;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Activity {
    id: bigint;
    title: string;
    description: string;
    timestampNanos: bigint;
    photos: Array<string>;
}
export interface GalleryImage {
    id: bigint;
    title: string;
    description: string;
    imageUrl: string;
    timestampNanos: bigint;
}
export interface EditableEvent {
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
export interface EditableGalleryImage {
    title: string;
    description: string;
    imageUrl: string;
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
    clearAllBackendSnapshots(): Promise<void>;
    createActivity(activity: EditableActivity): Promise<void>;
    createAnnouncement(announcement: EditableAnnouncement): Promise<void>;
    createBackendSnapshot(): Promise<bigint>;
    createEvent(event: EditableEvent): Promise<void>;
    createGalleryImage(image: EditableGalleryImage): Promise<void>;
    deleteActivity(id: bigint): Promise<void>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteBackendSnapshot(id: bigint): Promise<boolean>;
    deleteEvent(id: bigint): Promise<void>;
    deleteGalleryImage(id: bigint): Promise<void>;
    getActivities(): Promise<Array<Activity>>;
    getAlumniProfile(user: Principal): Promise<AlumniProfile | null>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getAnnouncementsByYearRange(startYear: number | null, endYear: number | null): Promise<Array<Announcement>>;
    getBackendStatus(): Promise<BackendStatus>;
    getCallerUserProfile(): Promise<AlumniProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepartments(): Promise<Array<string>>;
    getEvents(byPast: boolean | null): Promise<Array<Event>>;
    getGalleryImages(): Promise<Array<GalleryImage>>;
    getGraduationYears(): Promise<Uint16Array>;
    getUserProfile(user: Principal): Promise<AlumniProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovalStates(): Promise<Array<[Principal, ApprovalStatus]>>;
    listApprovalStatesWithProfiles(): Promise<Array<[Principal, ApprovalStatus, AlumniProfile | null]>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listBackendSnapshots(): Promise<Array<BackendSnapshot>>;
    requestApproval(): Promise<void>;
    saveAlumniProfile(profile: AlumniProfile): Promise<void>;
    saveCallerUserProfile(profile: AlumniProfile): Promise<void>;
    searchAlumniProfiles(filterYear: number | null, filterDepartment: string | null): Promise<Array<AlumniProfile>>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateActivity(id: bigint, updatedActivity: EditableActivity): Promise<void>;
    updateEvent(id: bigint, updatedEvent: EditableEvent): Promise<void>;
    updateGalleryImage(id: bigint, updatedImage: EditableGalleryImage): Promise<void>;
}
