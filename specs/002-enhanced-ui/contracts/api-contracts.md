# API Contracts: Enhanced UI with Modern Dashboard

**Feature Branch**: `002-enhanced-ui`
**Date**: 2025-11-18
**Phase**: 1 (Design & Contracts)

## Contract Status

**Status**: ✅ NO NEW CONTRACTS REQUIRED

This feature is a frontend-only refactor that consumes existing REST API endpoints without modification. All API contracts remain unchanged from the `001-event-management` feature.

## Consumed API Endpoints

### Events API (v1)

#### GET /api/v1/events
**Purpose**: Retrieve all events for the authenticated user's team

**Request**:
```http
GET /api/v1/events HTTP/1.1
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
[
  {
    "id": "uuid-v4",
    "name": "Team Offsite 2024",
    "description": "Annual team building event",
    "date": "2024-03-15T10:00:00Z",
    "location": "San Francisco, CA",
    "status": "upcoming",
    "teamId": "team-uuid",
    "createdAt": "2024-01-10T09:00:00Z",
    "updatedAt": "2024-01-10T09:00:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User not authorized for team

**Frontend Usage**:
- Dashboard: Aggregate for metrics (total, upcoming, completed counts)
- Events page: Display in card grid
- Activity feed: Show recent events (sorted by updatedAt)

---

#### GET /api/v1/events/:id
**Purpose**: Retrieve a single event by ID

**Request**:
```http
GET /api/v1/events/:id HTTP/1.1
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "id": "uuid-v4",
  "name": "Team Offsite 2024",
  "description": "Annual team building event",
  "date": "2024-03-15T10:00:00Z",
  "location": "San Francisco, CA",
  "status": "upcoming",
  "teamId": "team-uuid",
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User not authorized for team
- `404 Not Found`: Event does not exist

**Frontend Usage**:
- Edit modal: Pre-populate form fields with existing event data
- Event details page: Display full event information

---

#### POST /api/v1/events
**Purpose**: Create a new event

**Request**:
```http
POST /api/v1/events HTTP/1.1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Team Offsite 2024",
  "description": "Annual team building event",
  "date": "2024-03-15T10:00:00Z",
  "location": "San Francisco, CA",
  "status": "upcoming",
  "teamId": "team-uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "new-uuid-v4",
  "name": "Team Offsite 2024",
  "description": "Annual team building event",
  "date": "2024-03-15T10:00:00Z",
  "location": "San Francisco, CA",
  "status": "upcoming",
  "teamId": "team-uuid",
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (invalid date, missing required fields)
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User not authorized for team

**Validation Rules** (enforced by backend):
- `name`: Required, min 3 characters
- `description`: Required, min 10 characters
- `date`: Required, ISO 8601 format, must be in the future
- `location`: Required, min 3 characters
- `status`: Required, enum: `upcoming`, `in_progress`, `completed`, `cancelled`
- `teamId`: Required, valid UUID, user must belong to team

**Frontend Usage**:
- Create event modal: Submit form data
- Optimistic updates: Show new event in grid immediately, rollback on error

---

#### PUT /api/v1/events/:id
**Purpose**: Update an existing event

**Request**:
```http
PUT /api/v1/events/:id HTTP/1.1
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Team Offsite 2024 (Updated)",
  "status": "in_progress"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid-v4",
  "name": "Team Offsite 2024 (Updated)",
  "description": "Annual team building event",
  "date": "2024-03-15T10:00:00Z",
  "location": "San Francisco, CA",
  "status": "in_progress",
  "teamId": "team-uuid",
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-11T14:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User not authorized for team
- `404 Not Found`: Event does not exist

**Validation Rules**:
- All fields are optional (partial update)
- Same validation rules as POST for provided fields

**Frontend Usage**:
- Edit event modal: Submit updated fields only
- Optimistic updates: Update event card immediately, rollback on error

---

#### DELETE /api/v1/events/:id
**Purpose**: Delete an event

**Request**:
```http
DELETE /api/v1/events/:id HTTP/1.1
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User not authorized for team
- `404 Not Found`: Event does not exist

**Frontend Usage**:
- Event card: Delete button (future feature, not in MVP)
- Optimistic updates: Remove from grid immediately, rollback on error

---

### Authentication API (v1)

#### POST /api/v1/auth/login
**Purpose**: Authenticate user and receive JWT token

**Request**:
```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```http
HTTP/1.1 200 OK
Set-Cookie: token=<jwt-token>; HttpOnly; Secure; SameSite=Strict

{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "Alice Johnson",
    "teamId": "team-uuid"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format
- `404 Not Found`: User does not exist

**Frontend Usage**:
- Login page: Submit email, store user context in Zustand
- No changes required for this feature

---

#### POST /api/v1/auth/logout
**Purpose**: Invalidate current session

**Request**:
```http
POST /api/v1/auth/logout HTTP/1.1
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```http
HTTP/1.1 200 OK
Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0

{
  "success": true
}
```

**Frontend Usage**:
- Logout button (in navigation/user menu)
- No changes required for this feature

---

## Frontend API Client

**Location**: `apps/frontend/src/services/api.ts` (existing)

**No changes required**. The existing API client already supports all needed operations:

```typescript
// Existing API client (no modifications)
export const api = {
  // Events
  getEvents: (teamId: string) => fetch(`/api/v1/events?teamId=${teamId}`),
  getEvent: (id: string) => fetch(`/api/v1/events/${id}`),
  createEvent: (data: CreateEventInput) =>
    fetch('/api/v1/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: UpdateEventInput) =>
    fetch(`/api/v1/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) =>
    fetch(`/api/v1/events/${id}`, { method: 'DELETE' }),

  // Auth
  login: (email: string) =>
    fetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
  logout: () => fetch('/api/v1/auth/logout', { method: 'POST' }),
}
```

## Contract Testing

**Status**: ✅ Existing contract tests cover all API endpoints

**Location**: `apps/backend/tests/integration/events.test.ts`

**Coverage**:
- ✅ GET /api/v1/events (list all events)
- ✅ GET /api/v1/events/:id (get single event)
- ✅ POST /api/v1/events (create event)
- ✅ PUT /api/v1/events/:id (update event)
- ✅ DELETE /api/v1/events/:id (delete event)
- ✅ Authentication middleware (401/403 responses)
- ✅ Team isolation (cross-tenant access prevention)

**No new contract tests required** for this feature, since we're not modifying the API.

---

## Error Handling Contract

**Frontend Error Handling Strategy**:

```typescript
// All API errors follow this shape (backend standard)
interface ApiError {
  type: string // RFC 7807 Problem Details type URI
  title: string // Human-readable error title
  status: number // HTTP status code
  detail: string // Detailed error message
  instance?: string // Request instance ID for debugging
}

// Example error response
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Event name must be at least 3 characters",
  "instance": "/api/v1/events"
}

// Frontend error handler (existing, in api.ts)
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.detail || error.title)
  }
  return response.json()
}
```

---

## Backend Contract Guarantees

**Immutability**:
- ✅ All endpoints return data following the `Event` interface shape
- ✅ Field types are guaranteed (no `null` for required fields)
- ✅ Dates are always ISO 8601 strings
- ✅ Status values are strictly `upcoming | in_progress | completed | cancelled`

**Team Isolation**:
- ✅ Users can only access events for teams they belong to
- ✅ API enforces tenant boundaries via JWT claims
- ✅ Cross-tenant access returns `403 Forbidden`

**Performance**:
- ✅ GET /api/v1/events returns in <500ms for up to 1000 events
- ✅ POST/PUT /api/v1/events returns in <200ms

---

**Contracts Complete**: All consumed APIs documented. No new contracts required for this frontend-only feature.
