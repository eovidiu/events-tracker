# Contributing to Events Tracker

Thank you for your interest in contributing to Events Tracker! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and considerate of others. We aim to foster an inclusive and welcoming community.

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Install dependencies**: `pnpm install`
3. **Set up the database**:
   ```bash
   cd apps/backend
   pnpm drizzle:generate
   pnpm migrate
   pnpm seed  # Optional: Add sample data
   ```
4. **Create a branch** for your work: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running the Application

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend (runs on http://localhost:3000)
cd apps/backend
pnpm dev

# Terminal 2 - Frontend (runs on http://localhost:5173)
cd apps/frontend
pnpm dev
```

### Running Tests

Always run tests before submitting a PR:

```bash
# Run all tests
pnpm test

# Run backend tests
cd apps/backend
pnpm test

# Run frontend unit tests
cd apps/frontend
pnpm test

# Run E2E tests
cd apps/frontend
pnpm test:e2e

# Run accessibility tests
cd apps/frontend
pnpm test -- tests/accessibility
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing or `unknown` with type guards
- Use type inference where possible

### Code Style

- Use ESLint for linting: `pnpm lint`
- Format code consistently (follow existing patterns)
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)

### React Components

- Use functional components with hooks
- Extract complex logic into custom hooks
- Use Adobe React Spectrum components for UI consistency
- Follow accessibility best practices (WCAG 2.1)

### Backend Code

- Use Fastify route schemas for validation and documentation
- Implement proper error handling
- Use structured logging with Pino
- Follow RESTful API conventions

## Testing Requirements

### Unit Tests

- Write unit tests for all new features
- Aim for high code coverage (>80%)
- Test edge cases and error conditions
- Use descriptive test names

Example:
```typescript
describe('EventForm - Edit Mode', () => {
  it('should render in edit mode when eventId is provided', () => {
    // Test implementation
  })
})
```

### Integration Tests

- Test complete user flows
- Verify integration between components
- Mock external dependencies appropriately

### E2E Tests

- Add E2E tests for critical user journeys
- Use Playwright for browser automation
- Test across different scenarios (happy path, error cases)

### Accessibility Tests

- Run axe-core accessibility tests on new components
- Ensure keyboard navigation works
- Verify screen reader compatibility
- Test color contrast ratios

## Commit Guidelines

### Commit Message Format

Use descriptive commit messages following this format:

```
<type>: <short description>

<optional longer description>
<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Code formatting (no logic changes)
- `chore`: Maintenance tasks

**Examples:**
```
feat: add optimistic locking for concurrent edit detection

Implements updatedAt timestamp checking to detect when
another user has modified an event since it was loaded.
Returns 409 Conflict error in such cases.

Closes #80
```

```
fix: resolve unsaved changes warning not showing

The beforeunload event listener was not properly attached
due to incorrect dependency array in useEffect.

Fixes #88
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`pnpm test`)
2. ✅ No linting errors (`pnpm lint`)
3. ✅ Code is properly formatted
4. ✅ Documentation is updated (if needed)
5. ✅ Commit messages follow guidelines
6. ✅ Branch is up-to-date with main

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #<issue-number>

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Accessibility tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. Submit your PR with a clear description
2. Address reviewer feedback promptly
3. Keep discussions focused and professional
4. Update your PR based on feedback
5. Once approved, your PR will be merged

### After Merge

- Delete your feature branch
- Pull the latest main branch
- Celebrate your contribution! 🎉

## Architecture Decisions

When making significant architectural changes:

1. **Discuss first**: Open an issue to discuss major changes
2. **Document**: Update architecture docs if needed
3. **Consider impact**: Think about backward compatibility
4. **Test thoroughly**: Ensure no regressions

## Database Migrations

When modifying the database schema:

1. Create a migration using Drizzle Kit
2. Test migration both up and down
3. Update seed data if needed
4. Document any manual steps required

Example:
```bash
cd apps/backend
pnpm drizzle-kit generate:sqlite
pnpm migrate
```

## Need Help?

- Check existing issues and discussions
- Review the README.md
- Look at existing code for examples
- Ask questions in your PR or issue

## Recognition

All contributors will be recognized in the project. Thank you for making Events Tracker better!
