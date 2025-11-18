# Quickstart: Event Management Feature

**Feature**: 001-event-management
**Stack**: SQLite + Fastify + Drizzle ORM + React + TypeScript + Adobe React Spectrum
**Estimated Setup Time**: 20 minutes

## Prerequisites

- **Node.js**: 20 LTS or higher
- **pnpm**: 8+ (or npm/yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with TypeScript, ESLint plugins)

## 1. Clone and Install Dependencies

### Install pnpm (if not already installed)

```bash
# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Verify installation
pnpm --version
```

### Install Monorepo Dependencies

```bash
# From repository root
pnpm install

# This installs dependencies for all workspaces:
# - apps/frontend
# - apps/backend
# - packages/shared
```

**Key Dependencies Installed**:

**Frontend**:
- `react` (18.2+), `react-dom`
- `@adobe/react-spectrum` - UI component library
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form handling
- `zod` - Validation schemas
- `zustand` - Client state management
- `date-fns` - Date manipulation
- `vitest`, `@testing-library/react` - Testing

**Backend**:
- `fastify` (4.x) - Web framework
- `drizzle-orm` - TypeScript ORM
- `better-sqlite3` - SQLite driver
- `lucia` - Authentication
- `@fastify/swagger` - OpenAPI generation
- `@fastify/cors` - CORS support
- `pino` - Logging
- `vitest` - Testing

**Shared**:
- `zod` - Validation schemas (shared between frontend/backend)

## 2. Configure Environment Variables

### Backend Environment

Create `apps/backend/.env`:

```bash
# Database
DATABASE_URL=./database.sqlite

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-secret-key-here-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Frontend Environment

Create `apps/frontend/.env.local`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1

# For production:
# VITE_API_URL=https://api.yourdomain.com/api/v1
```

**Security Note**: Never commit `.env` or `.env.local` to git. They're already in `.gitignore`.

## 3. Initialize Database

### Run Database Migrations

```bash
# From repository root
cd apps/backend

# Generate migration files (if not exists)
pnpm drizzle-kit generate:sqlite

# Apply migrations to create tables
pnpm drizzle-kit push:sqlite

# Alternatively, run migration programmatically
pnpm migrate
```

**What This Does**:
- Creates `teams`, `team_members`, `users`, `sessions`, `events` tables
- Creates indexes for performance (team_id, user_id, dates)
- Sets up foreign key constraints with CASCADE deletes
- Creates triggers for `updated_at` timestamps

### Seed Development Data (Optional)

```bash
# From apps/backend directory
pnpm seed

# This creates:
# - 2 test teams (Engineering, Marketing)
# - 3 test users (alice@example.com, bob@example.com, charlie@example.com)
# - Team memberships with different roles
# - 5 sample events across teams
```

### Verify Database

```bash
# From apps/backend directory
# Open SQLite CLI
sqlite3 database.sqlite

# Run queries
sqlite> .tables
# Expected: events, sessions, team_members, teams, users

sqlite> .schema events
# Shows CREATE TABLE statement

sqlite> SELECT COUNT(*) FROM events;
# Should show 5 if you ran seed

sqlite> .quit
```

## 4. Start Backend Development Server

```bash
# From apps/backend directory
pnpm dev

# Server starts at http://localhost:3000
```

**Expected Output**:
```
[INFO] Starting Fastify server...
[INFO] Server listening at http://0.0.0.0:3000
[INFO] OpenAPI docs available at http://localhost:3000/documentation
```

### Verify Backend is Running

```bash
# In another terminal
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-18T..."}
```

### Explore OpenAPI Documentation

Open `http://localhost:3000/documentation` in your browser to see:
- All API endpoints (POST /api/v1/events, GET /api/v1/events, etc.)
- Request/response schemas
- Try-it-out functionality
- JSON Schema definitions

## 5. Start Frontend Development Server

```bash
# From apps/frontend directory (new terminal)
pnpm dev

# Server starts at http://localhost:5173
```

**Expected Output**:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

## 6. Create Test User and Authenticate

### Option A: Via Backend API (Recommended)

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'

# Expected response:
# {
#   "user": {
#     "id": "...",
#     "email": "test@example.com",
#     "name": "Test User"
#   },
#   "session": { ... }
# }
```

### Option B: Via SQLite CLI

```bash
sqlite3 apps/backend/database.sqlite

INSERT INTO users (id, email, name, created_at, updated_at)
VALUES (
  lower(hex(randomblob(16))),
  'test@example.com',
  'Test User',
  unixepoch(),
  unixepoch()
);

.quit
```

### Add Test User to Team

```bash
sqlite3 apps/backend/database.sqlite

-- Get team ID (assuming you ran seed)
SELECT id FROM teams WHERE name = 'Engineering Team';

-- Add user to team
INSERT INTO team_members (user_id, team_id, role, joined_at)
SELECT
  u.id,
  '11111111-1111-1111-1111-111111111111',  -- Engineering Team from seed
  'admin',
  unixepoch()
FROM users u
WHERE u.email = 'test@example.com';

.quit
```

## 7. Verify Setup: Create Your First Event

### 7.1 Sign In

1. Navigate to `http://localhost:5173`
2. Sign in with:
   - Email: `test@example.com`
   - Password: `testpassword123`

### 7.2 Create Event (Via API)

```bash
# First, login and capture session cookie
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Create event with session cookie
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "teamId": "11111111-1111-1111-1111-111111111111",
    "title": "Test Event",
    "description": "My first event",
    "location": "Online",
    "startDate": "2025-02-01T10:00:00Z",
    "endDate": "2025-02-01T11:00:00Z",
    "timezone": "UTC"
  }'

# Expected response:
# {
#   "id": "...",
#   "teamId": "11111111-1111-1111-1111-111111111111",
#   "title": "Test Event",
#   "description": "My first event",
#   ...
# }
```

### 7.3 Verify Event Created

```bash
sqlite3 apps/backend/database.sqlite

SELECT id, title, location, start_date, team_id FROM events;

.quit
```

## 8. Run Tests

### Backend Tests

```bash
# From apps/backend directory
pnpm test

# Run tests in watch mode (for TDD)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

**Expected Output**:
```
✓ tests/routes/events.test.ts (8 tests)
✓ tests/services/eventService.test.ts (6 tests)
✓ tests/middleware/teamContext.test.ts (4 tests)

Test Files  3 passed (3)
     Tests  18 passed (18)
```

### Frontend Tests

```bash
# From apps/frontend directory
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

**Expected Output**:
```
✓ src/components/events/EventForm.test.tsx (5 tests)
✓ src/hooks/useEvents.test.ts (7 tests)

Test Files  2 passed (2)
     Tests  12 passed (12)
```

## 9. Development Workflow

### Typical TDD Workflow

1. **Write Failing Test**:
   ```typescript
   // apps/frontend/src/components/events/EventForm.test.tsx
   import { render, screen } from '@testing-library/react'
   import userEvent from '@testing-library/user-event'
   import { EventForm } from './EventForm'

   it('should validate title is required', async () => {
     render(<EventForm />)
     await userEvent.click(screen.getByRole('button', { name: /save/i }))
     expect(screen.getByText(/title is required/i)).toBeInTheDocument()
   })
   ```

2. **Run Test** (should fail):
   ```bash
   cd apps/frontend
   pnpm test EventForm.test.tsx
   ```

3. **Implement Feature**:
   ```typescript
   // apps/frontend/src/components/events/EventForm.tsx
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { eventSchema } from '@event-hub/shared/schemas/event.schema'

   const form = useForm({
     resolver: zodResolver(eventSchema)
   })
   ```

4. **Run Test Again** (should pass)

5. **Refactor** if needed

6. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add event title validation"
   ```

### Database Migrations

When changing schema:

```bash
# From apps/backend directory

# 1. Update Drizzle schema
# Edit src/db/schema.ts

# 2. Generate migration SQL
pnpm drizzle-kit generate:sqlite

# 3. Review migration file in drizzle/migrations/

# 4. Apply migration
pnpm drizzle-kit push:sqlite

# Or use programmatic migration
pnpm migrate
```

### Hot Reload

Both servers support hot reload:
- **Frontend (Vite)**: HMR updates on file save
- **Backend (Fastify)**: Auto-restarts on file change (via tsx watch)
- **Database**: In-memory for tests, file-based for dev (persists across restarts)

## 10. Database Management Tools

### Drizzle Studio (Visual Database Browser)

```bash
# From apps/backend directory
pnpm drizzle-kit studio

# Opens at http://localhost:4983
```

**Features**:
- View/edit all tables
- Run SQL queries
- Visualize relationships
- Browse data with pagination

### SQLite CLI

```bash
# From repository root
sqlite3 apps/backend/database.sqlite

# Useful commands:
.tables                  # List all tables
.schema events           # Show table schema
.mode column             # Pretty print
.headers on              # Show column names

SELECT * FROM events;    # Query data

.quit
```

## 11. Common Commands Reference

```bash
# Root level (monorepo)
pnpm install             # Install all workspace dependencies
pnpm build               # Build all packages
pnpm test                # Run all tests
pnpm lint                # Lint all workspaces
pnpm type-check          # TypeScript check all workspaces

# Backend (from apps/backend)
pnpm dev                 # Start dev server with hot reload
pnpm build               # Build for production
pnpm start               # Start production server
pnpm test                # Run tests
pnpm test:watch          # Watch mode
pnpm migrate             # Run database migrations
pnpm seed                # Seed database
pnpm drizzle-kit studio  # Open Drizzle Studio

# Frontend (from apps/frontend)
pnpm dev                 # Start dev server
pnpm build               # Production build
pnpm preview             # Preview production build
pnpm test                # Run tests
pnpm test:watch          # Watch mode
pnpm lint                # Run ESLint
pnpm type-check          # Run TypeScript compiler

# Database
sqlite3 apps/backend/database.sqlite  # Open SQLite CLI
```

## 12. Troubleshooting

### Backend Won't Start

**Error**: `Cannot find module 'better-sqlite3'`
**Fix**:
```bash
cd apps/backend
pnpm install
# better-sqlite3 requires native compilation
```

**Error**: `SQLITE_CANTOPEN: unable to open database file`
**Fix**:
```bash
# Ensure database directory exists
mkdir -p apps/backend
cd apps/backend
pnpm migrate  # Creates database.sqlite
```

**Error**: `Port 3000 already in use`
**Fix**:
```bash
# Kill process using port
lsof -ti:3000 | xargs kill -9

# Or change PORT in apps/backend/.env
PORT=3001
```

### Frontend API Calls Failing

**Error**: `Network Error` or `CORS error`
**Fix**:
1. Ensure backend is running (`http://localhost:3000`)
2. Check `VITE_API_URL` in `apps/frontend/.env.local`
3. Verify CORS settings in `apps/backend/.env`:
   ```bash
   CORS_ORIGIN=http://localhost:5173
   ```
4. Restart both servers

### Database Schema Out of Sync

**Error**: `no such table: events`
**Fix**:
```bash
cd apps/backend
pnpm drizzle-kit push:sqlite  # Apply migrations
pnpm seed                      # Re-seed data
```

### TypeScript Types Not Updating

**Error**: Import errors for shared types
**Fix**:
```bash
# Rebuild shared package
cd packages/shared
pnpm build

# Re-install in consuming packages
cd ../..
pnpm install
```

### Session/Auth Not Working

**Error**: `Unauthorized` or session not persisting
**Fix**:
1. Check `SESSION_SECRET` is set in `apps/backend/.env`
2. Ensure cookies are enabled in browser
3. Verify same-site cookie settings if using different domains
4. Check Lucia Auth session table:
   ```bash
   sqlite3 apps/backend/database.sqlite
   SELECT * FROM sessions;
   ```

## 13. Next Steps

After setup, proceed with implementation:

1. **Read `data-model.md`**: Understand database schema and middleware patterns
2. **Review `contracts/rest-api.yaml`**: API endpoints reference
3. **Check `tasks.md`**: Implementation task list (136 tasks)
4. **Start Phase 1**: Setup tasks (T001-T016)
5. **Write Tests First**: Follow TDD workflow (Constitution Principle IV)

## 14. Production Deployment

When ready to deploy:

### Backend Deployment (Railway/Render/Fly.io)

1. **Add persistent volume** for SQLite database:
   - Railway: Add volume mounted at `/data`
   - Render: Add disk mounted at `/data`
   - Fly.io: Create volume with `fly volumes create`

2. **Update DATABASE_URL**:
   ```bash
   DATABASE_URL=/data/database.sqlite
   ```

3. **Run migrations on startup**:
   ```json
   // package.json
   {
     "scripts": {
       "start": "pnpm migrate && node dist/server.js"
     }
   }
   ```

4. **Set environment variables**:
   - `NODE_ENV=production`
   - `SESSION_SECRET=<strong-random-secret>`
   - `CORS_ORIGIN=https://yourdomain.com`

### Frontend Deployment (Vercel/Netlify)

1. **Update environment variables**:
   ```bash
   VITE_API_URL=https://api.yourdomain.com/api/v1
   ```

2. **Build and deploy**:
   ```bash
   cd apps/frontend
   pnpm build

   # Deploy to Vercel
   vercel deploy

   # Or deploy to Netlify
   netlify deploy --prod
   ```

## 15. Performance Optimization

### SQLite Optimization

```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode = WAL;

-- Optimize for read-heavy workloads
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache

-- Analyze for better query plans
ANALYZE;
```

Add to `apps/backend/src/db/client.ts`:
```typescript
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
```

### Frontend Optimization

- Enable React Query caching (staleTime, cacheTime)
- Use React.memo for expensive components
- Implement virtual scrolling for long event lists
- Code-split routes with React.lazy

## Resources

- **Fastify Docs**: https://fastify.dev
- **Drizzle ORM**: https://orm.drizzle.team
- **Lucia Auth**: https://lucia-auth.com
- **React Spectrum**: https://react-spectrum.adobe.com/react-spectrum/
- **React Query**: https://tanstack.com/query/latest/docs/react
- **Zod**: https://zod.dev
- **Vitest**: https://vitest.dev
- **SQLite**: https://sqlite.org/docs.html
- **Project Spec**: `specs/001-event-management/spec.md`
- **Data Model**: `specs/001-event-management/data-model.md`
- **API Contracts**: `specs/001-event-management/contracts/rest-api.yaml`

## Support

- **GitHub Issues**: Report bugs in project repo
- **Stack Overflow**: Tag `fastify`, `drizzle-orm`, `react-spectrum`
- **Fastify Discord**: https://discord.gg/fastify
- **Drizzle Discord**: https://discord.gg/drizzle
