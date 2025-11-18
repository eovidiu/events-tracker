export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Team {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: Date;
}
export interface Event {
    id: string;
    teamId: string;
    title: string;
    description?: string | null;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    createdBy: string;
    updatedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface EventWithDetails extends Event {
    team?: Team;
    creator?: User;
    updater?: User;
}
export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
}
//# sourceMappingURL=index.d.ts.map