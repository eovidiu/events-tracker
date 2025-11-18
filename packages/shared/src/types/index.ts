// User types
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// Team types
export interface Team {
  id: string
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

// Team member types
export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: Date
}

// Event types
export interface Event {
  id: string
  teamId: string
  title: string
  description?: string | null
  location: string
  startDate: Date
  endDate: Date
  timezone: string
  createdBy: string
  updatedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

// Event with related data
export interface EventWithDetails extends Event {
  team?: Team
  creator?: User
  updater?: User
}

// Session types
export interface Session {
  id: string
  userId: string
  expiresAt: Date
}
