<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: None (initial constitution)
Added sections:
  - Core Principles (5 principles defined)
  - Security & Compliance
  - Development Workflow
  - Governance
Removed sections: None (template placeholders replaced)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check section aligned)
  ✅ .specify/templates/spec-template.md (Scope/requirements alignment verified)
  ✅ .specify/templates/tasks-template.md (Task categorization aligned)
Follow-up TODOs: None
-->

# Event Hub Constitution

## Core Principles

### I. User-Centric Design

Event management workflows MUST prioritize user experience and task efficiency.
Features MUST reduce friction in common operations (creating events, managing
attendees, tracking RSVPs). All UI interactions MUST follow progressive
disclosure principles - show essential information first, details on demand.
Forms MUST validate in real-time and provide clear, actionable error messages.

**Rationale**: Event coordinators work under time pressure and need tools that
help rather than hinder. Poor UX leads to errors, missed deadlines, and
abandoned features.

### II. Multi-Tenancy & Data Isolation

Each team's data MUST be completely isolated from other teams. Users MUST only
access events and data for teams they belong to. The system MUST enforce
tenant boundaries at the database, API, and UI layers. Cross-tenant data
leakage is a critical failure condition.

**Rationale**: Organizations managing events across multiple teams require
strong data isolation for privacy, compliance, and operational safety.
Mixing team data would violate trust and potentially leak sensitive information.

### III. API-First Architecture

Every feature MUST be accessible via a documented REST API before UI
implementation. APIs MUST be versioned (semantic versioning). Breaking changes
MUST increment the major version and maintain backward compatibility for at
least one minor version cycle. All endpoints MUST return consistent error
responses following RFC 7807 Problem Details specification.

**Rationale**: API-first design enables mobile apps, integrations, automation,
and third-party extensions. It also enforces clear separation of concerns
between frontend and backend.

### IV. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written before implementation code. The red-green-refactor cycle
MUST be strictly followed: (1) Write failing test, (2) User approves test,
(3) Verify test fails, (4) Implement minimal code to pass, (5) Refactor.
Pull requests without tests covering new functionality MUST be rejected.

**Rationale**: Event management involves complex workflows with many edge cases
(timezone handling, RSVP limits, waitlists, cancellations). TDD ensures these
cases are explicitly tested rather than discovered in production.

### V. Observability & Audit Trails

All state-changing operations MUST be logged with user ID, timestamp, team ID,
and operation details. Event modifications, RSVP changes, and team membership
updates MUST create immutable audit log entries. System MUST support structured
logging (JSON format) for machine parsing. Performance-critical paths MUST be
instrumented with distributed tracing.

**Rationale**: Event management requires accountability and the ability to
answer "who changed what and when". Audit trails support compliance, debugging,
and user trust. Structured logs enable effective monitoring and alerting.

## Security & Compliance

### Authentication & Authorization

- System MUST support OAuth 2.0 / OIDC for enterprise SSO integration
- Session tokens MUST expire after 24 hours of inactivity
- Password-based accounts (if supported) MUST enforce minimum 12 characters,
  complexity requirements, and breach detection via HaveIBeenPwned API
- Role-based access control (RBAC) MUST enforce team-level permissions:
  Owner, Admin, Member, Viewer
- API keys MUST be scoped to specific teams and operations

### Data Protection

- All data in transit MUST use TLS 1.3 or higher
- Personal identifiable information (PII) MUST be encrypted at rest
- Data retention policies MUST support GDPR/CCPA requirements
- Users MUST be able to export their data in machine-readable format (JSON/CSV)
- Users MUST be able to delete their accounts and associated data (right to erasure)

### Input Validation

- All user inputs MUST be validated and sanitized on both client and server
- System MUST protect against OWASP Top 10 vulnerabilities
- File uploads MUST be scanned for malware and restricted by type/size
- SQL injection protection MUST use parameterized queries exclusively
- XSS protection MUST sanitize all user-generated content before rendering

## Development Workflow

### Code Review Requirements

- All changes MUST be reviewed by at least one team member before merge
- Pull requests MUST pass automated tests (unit, integration, contract)
- Pull requests MUST pass security scanning (dependency vulnerabilities, SAST)
- Pull requests MUST maintain or improve code coverage (minimum 80% line coverage)
- Breaking changes MUST be documented with migration guides

### Deployment Standards

- Deployments to production MUST go through staging environment first
- Staging environment MUST use production-like data (anonymized)
- Database migrations MUST be reversible and tested in staging
- Feature flags MUST control rollout of new functionality
- Zero-downtime deployments MUST be the default for user-facing services

### Documentation Requirements

- Public APIs MUST have OpenAPI 3.0+ specifications
- Each feature MUST have user-facing documentation in `/docs`
- Architecture Decision Records (ADRs) MUST document significant technical choices
- README MUST contain setup instructions that work from a fresh clone

## Governance

### Amendment Process

1. Proposed changes MUST be documented in a pull request to this constitution
2. Proposal MUST include rationale and impact analysis
3. Team consensus required (75% approval for MAJOR changes, 50% for MINOR/PATCH)
4. Changes take effect only after merge to main branch

### Versioning Policy

- **MAJOR**: Backward-incompatible changes, principle removals, scope redefinitions
- **MINOR**: New principles added, materially expanded guidance, new mandatory sections
- **PATCH**: Clarifications, typo fixes, wording improvements, non-semantic refinements

### Compliance Reviews

- All pull requests MUST verify compliance with this constitution
- Violations MUST be justified in the Complexity Tracking section of `plan.md`
- Complexity MUST be justified with specific rationale; default to simplicity
- Constitution supersedes all other practices and conventions

### Agent-Specific Guidance

Runtime development guidance is maintained in agent-specific files (e.g.,
`.claude/CLAUDE.md` for Claude Code). These files contain agent-specific
instructions and do not override constitutional principles. Refer to the
appropriate agent context file for technology stack decisions and
implementation patterns.

**Version**: 1.0.0 | **Ratified**: 2025-11-18 | **Last Amended**: 2025-11-18
