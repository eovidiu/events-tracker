# Events Tracker

A full-stack event management application built with modern web technologies.

## Features

- **User Authentication**: Secure login system with session management
- **Team Management**: Create and manage teams for organizing events
- **Event Management**:
  - Create, edit, and view events
  - Track event details (title, description, location, dates, timezone)
  - Multi-day event support
  - Past event warnings
- **Advanced Features**:
  - Optimistic UI updates for better user experience
  - Conflict detection for concurrent edits (optimistic locking)
  - Unsaved changes warnings
  - Search and filter events
  - Sort events by multiple criteria
- **Accessibility**: WCAG 2.1 compliant with comprehensive accessibility tests
- **Error Handling**: Error boundaries and user-friendly error pages

## Tech Stack

### Frontend
- **Framework**: React 18.2+ with TypeScript 5.3+
- **UI Library**: Adobe React Spectrum (Design System)
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Accessibility**: axe-core

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **Database**: SQLite 3.x with Drizzle ORM
- **Authentication**: Lucia Auth with session management
- **Validation**: Zod schemas
- **Logging**: Pino logger with request ID tracking
- **Testing**: Vitest

## Project Structure

```
test-3/
├── apps/
│   ├── backend/          # Fastify backend API
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   ├── db/       # Database schema and migrations
│   │   │   └── app.ts    # Fastify app configuration
│   │   └── tests/        # Backend tests
│   └── frontend/         # React frontend
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── pages/      # Page components
│       │   ├── hooks/      # Custom React hooks
│       │   └── services/   # API client
│       └── tests/          # Frontend tests
├── packages/
│   └── shared/           # Shared types and schemas
└── specs/                # Feature specifications
```

## Getting Started

### Prerequisites

- Node.js 20 LTS or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test-3
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
cd apps/backend
pnpm drizzle:generate
pnpm migrate
```

4. Seed the database (optional):
```bash
pnpm seed
```

### Development

Start both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:5173`.

### Testing

Run all tests:
```bash
pnpm test
```

Run E2E tests:
```bash
cd apps/frontend
pnpm test:e2e
```

Run accessibility tests:
```bash
cd apps/frontend
pnpm test -- tests/accessibility
```

### Linting

```bash
pnpm lint
```

## API Documentation

The backend exposes a RESTful API with the following main endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/session` - Check session status

### Events
- `GET /api/v1/events` - List all events for user's teams
- `GET /api/v1/events/:id` - Get event details with relations
- `POST /api/v1/events` - Create a new event
- `PATCH /api/v1/events/:id` - Update an event
- `DELETE /api/v1/events/:id` - Delete an event

### Teams
- `GET /api/v1/teams` - List user's teams
- `POST /api/v1/teams` - Create a new team

For detailed API documentation, see the OpenAPI specification (generated via Fastify's schema support).

## Key Features Implementation

### Optimistic Locking (T080)
Events include an `updatedAt` timestamp that is checked during updates to detect concurrent modifications. If another user has modified the event since you loaded it, you'll receive a 409 Conflict error.

### Optimistic Updates (T092)
The UI updates immediately when you make changes, providing instant feedback. If the server request fails, changes are automatically rolled back.

### Unsaved Changes Warning (T088)
When editing forms, you'll be warned before navigating away if you have unsaved changes.

### Search & Filter (T113-T115)
Events can be searched by title/description and filtered by various criteria. Results can be sorted by date, title, or location.

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

MIT
