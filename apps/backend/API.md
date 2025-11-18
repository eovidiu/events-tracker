# Events Tracker API Documentation

The Events Tracker API is built with Fastify and provides OpenAPI/Swagger documentation.

## Accessing the Documentation

When the backend server is running, you can access the interactive API documentation at:

**Swagger UI**: http://localhost:3000/documentation

This provides an interactive interface where you can:
- Browse all available endpoints
- View request/response schemas
- Test API endpoints directly from the browser
- See authentication requirements

## Generating OpenAPI JSON Spec

To export the OpenAPI specification as JSON:

1. Start the backend server:
   ```bash
   cd apps/backend
   pnpm dev
   ```

2. Download the spec:
   ```bash
   curl http://localhost:3000/documentation/json > openapi.json
   ```

Alternatively, you can access the spec at: http://localhost:3000/documentation/json

## API Overview

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
The API uses session-based authentication with HTTP-only cookies. Most endpoints require authentication.

### Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/session` - Check session status

#### Events
- `GET /api/v1/events` - List all events for user's teams
- `GET /api/v1/events/:id` - Get event details with relations
- `POST /api/v1/events` - Create a new event
- `PATCH /api/v1/events/:id` - Update an event (with optimistic locking)
- `DELETE /api/v1/events/:id` - Delete an event

#### Teams
- `GET /api/v1/teams` - List user's teams
- `POST /api/v1/teams` - Create a new team

### Request/Response Format

All requests and responses use JSON format with `Content-Type: application/json`.

### Error Responses

Error responses follow this format:
```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Concurrent modification detected (optimistic locking)
- `500 Internal Server Error` - Server error

### Special Features

#### Optimistic Locking (T080)
Event updates support optimistic locking to detect concurrent modifications:
- Include the `updatedAt` timestamp from the current event in your PATCH request
- If another user has modified the event since you loaded it, you'll receive a 409 Conflict error
- Frontend applications should handle this by refreshing the data and prompting the user to retry

#### Request ID Tracking (T121)
All requests include a request ID for distributed tracing:
- Automatically generated if not provided
- Can be specified via `x-request-id` header
- Included in all log entries for correlation
- Returned in the response headers

#### Structured Logging (T122)
All mutation operations (create, update, delete) are logged with structured data including:
- Request ID
- User ID
- Action type
- Affected resource IDs
- Timestamps

## Schema Validation

All endpoints use Zod schemas for validation. The OpenAPI specification includes detailed schema information for:
- Request body validation
- Query parameter validation
- Path parameter validation
- Response validation

See the Swagger UI for detailed schema documentation.
