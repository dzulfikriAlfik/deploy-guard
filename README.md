# DeployGuard

DeployGuard is an Operational Intelligence Platform for engineering teams.

It collects structured production logs and operational events from multiple projects, stores them securely, makes them searchable by semantic meaning, and helps engineers investigate incidents faster using historical context, semantic search, and AI-assisted RCA.

DeployGuard is not a ChatGPT wrapper.

It is a production-focused engineering platform designed to preserve operational knowledge, reduce repeated investigation, and help teams understand production failures faster.

---

## Core Problem

Engineering teams often lose operational knowledge.

When a production incident happens, engineers usually need to:

* manually inspect logs
* search old Slack messages
* search old documents
* remember previous incidents
* ask senior engineers
* investigate similar bugs from scratch

This becomes worse when:

* old engineers resign
* old RCA knowledge is not documented
* logs are scattered across systems
* similar incidents are hard to search
* production bugs reappear
* deployment confidence decreases

The biggest problem is not the lack of logs.

The biggest problem is that logs, incidents, RCA knowledge, and deployment context are fragmented and not searchable by meaning.

DeployGuard solves this by becoming the operational memory layer for engineering teams.

---

## Product Vision

DeployGuard aims to become an internal Operational Intelligence Platform that can:

* collect production logs from multiple systems
* normalize operational events
* preserve incident history
* search logs and incidents semantically
* find similar historical incidents
* generate AI-assisted RCA
* provide project-scoped dashboards
* help engineers investigate issues faster
* reduce repeated incident investigation

---

## Example Projects

DeployGuard is designed to support multiple real-world projects such as:

* Realcast Web
* Realcast iOS
* Digital School Note
* OneRoster
* LTI services
* background workers
* deployment pipelines

Each project has isolated access control.

A project admin automatically cannot access another project outside their assigned scope.

For example:

* Realcast Admin cannot access DSN.
* DSN Admin cannot access Realcast.
* OneRoster Admin cannot access Realcast or DSN.

This rule must be enforced by the backend, not only by frontend UI.

---

## Target Users

### Platform Admin

A platform admin manages DeployGuard globally.

Responsibilities:

* create projects
* create users
* assign project access
* assign user authentication type
* manage global configuration
* manage ingestion credentials
* manage platform-wide permissions

### Project Admin

A project admin manages only one or more assigned project scopes.

Examples:

* Realcast Admin
* DSN Admin
* OneRoster Admin

A project admin cannot access projects outside their assigned scope.

### Engineer

An engineer investigates incidents inside assigned projects.

Responsibilities:

* search logs
* analyze incidents
* view RCA history
* view similar incidents
* inspect operational memory

### Viewer

A viewer can only read dashboard data for assigned projects.

### Ingestion Client

An ingestion client is a system identity used by external applications to send logs or operational events to DeployGuard.

Examples:

* Realcast Web backend
* Realcast iOS crash reporter
* DSN backend
* OneRoster worker
* LTI service

---

## Core Features

### 1. Project-Scoped RBAC

DeployGuard uses project-scoped role-based access control.

Access is determined by:

* user
* project
* role
* permissions

Initial roles:

* platform_admin
* project_admin
* engineer
* viewer
* ingestion_client

Example permissions:

* project:read
* project:update
* members:manage
* logs:ingest
* logs:read
* incidents:read
* incidents:analyze
* api_keys:manage

Backend authorization is mandatory for every protected request.

Frontend authorization is only for UI convenience and must not be trusted as the only security layer.

---

### 2. Secure Authentication

DeployGuard supports:

* local authentication
* optional OIDC authentication
* HttpOnly cookie-based web session
* short-lived access token
* refresh token rotation
* logout with server-side session revocation
* Redis-based access token denylist

Tokens must not be stored in:

* localStorage
* sessionStorage
* unsafe JavaScript-accessible cookies

For web dashboard authentication, DeployGuard uses secure HttpOnly cookies.

Initial cookie strategy:

```txt
SameSite=Lax
HttpOnly=true
Secure=true
```

Access token cookie:

```txt
Path=/api
Short lifetime
```

Refresh token cookie:

```txt
Path=/api/v1/auth/refresh
Longer lifetime
Rotation enabled
```

CSRF protection is mandatory because cookies are automatically sent by browsers.

DeployGuard must implement:

* SameSite=Lax
* CSRF token protection for unsafe HTTP methods
* Origin validation
* Referer validation where applicable
* strict CORS configuration

---

### 3. Session Restore Flow

When the dashboard loads, the frontend calls:

```txt
GET /api/v1/auth/me
```

Expected flow:

```txt
Frontend boot
↓
Call /auth/me
↓
Access token cookie is sent automatically
↓
If valid, return user profile and project scope
↓
Store profile in global state
↓
Dashboard is ready
```

If access token is expired:

```txt
/auth/me returns 401 ACCESS_TOKEN_EXPIRED
↓
Frontend calls /auth/refresh
↓
Backend rotates refresh token
↓
Backend sets new HttpOnly cookies
↓
Frontend retries /auth/me
↓
Profile is restored
```

If refresh token is expired or revoked:

```txt
/auth/refresh returns 401
↓
Frontend clears user state
↓
Redirect to login page
```

Frontend must implement a manual single refresh lock to prevent multiple parallel refresh requests.

No external mutex library is required.

---

### 4. User Management

DeployGuard must support user management.

Platform admins can:

* create users
* update users
* disable users
* assign auth type
* assign project access
* assign project role

Supported auth types:

```txt
local
oidc
```

OIDC is optional.

Local auth must work without OIDC.

---

### 5. REST API for Ingestion

DeployGuard uses REST API for ingestion because ingestion must be simple, stable, and easy to call from different systems.

Initial endpoint:

```txt
POST /api/v1/ingest/logs
```

Ingestion sources may include:

* backend applications
* mobile apps
* workers
* deployment scripts
* scheduled jobs
* monitoring systems

Ingestion flow:

```txt
Source application
↓
Send structured log/event to DeployGuard
↓
Validate payload
↓
Normalize data
↓
Store raw log
↓
Store structured log
↓
Queue embedding job
↓
Generate embedding
↓
Store vector
↓
Make log searchable
```

---

### 6. Optional GraphQL for Dashboard

DeployGuard may use GraphQL for read-heavy dashboard features.

GraphQL is useful for:

* nested incident queries
* project dashboard
* RCA exploration
* semantic search result composition
* reducing over-fetching and under-fetching

Initial strategy:

```txt
REST:
- ingestion
- auth
- user management
- project management
- operational commands

GraphQL:
- optional dashboard read model
- semantic search exploration
- nested RCA queries
```

GraphQL is optional and should be introduced only when REST read endpoints become too fragmented or dashboard queries become deeply nested.

---

### 7. PostgreSQL as Primary Database

DeployGuard uses PostgreSQL as the primary relational database.

Reasons:

* strong relational model
* transaction support
* JSONB support
* mature indexing
* good analytics capability
* pgvector support
* strong ecosystem
* suitable for project-scoped data isolation

Connection management is critical.

DeployGuard must not open and close a PostgreSQL connection per request.

DeployGuard must use:

* connection pooling
* query timeout
* transaction timeout
* controlled worker concurrency
* optional PgBouncer when scaling horizontally

---

### 8. pgvector as Initial Vector Storage

DeployGuard starts with pgvector.

Reasons:

* simpler architecture
* one database for relational and vector data
* easier local development
* easier joining between logs, incidents, projects, and embeddings
* good enough for early-stage semantic search

However, DeployGuard must be designed to migrate to a dedicated vector database later.

Potential future vector databases:

* Qdrant
* Milvus
* Weaviate

To support future migration, vector access must be isolated behind a repository interface.

Example abstraction:

```txt
VectorRepository
- upsertEmbedding
- searchSimilar
- deleteEmbedding
```

Initial implementation:

```txt
PgVectorRepository
```

Future implementation:

```txt
QdrantVectorRepository
MilvusVectorRepository
```

Application services must not depend directly on pgvector SQL everywhere.

---

### 9. Redis Usage

DeployGuard uses Redis for:

* access token denylist
* rate limiting
* background job queue
* embedding job queue
* temporary job status
* future live dashboard support

Initial Redis responsibilities:

```txt
1. Access token denylist
2. Async job queue for embedding generation
```

WebSocket is not required in the first phase.

For live updates later, DeployGuard may use:

* Server-Sent Events
* WebSocket

---

## Technology Stack

### Backend

Recommended stack:

* Node.js
* NestJS
* TypeScript
* PostgreSQL
* pgvector
* Redis
* BullMQ
* Zod or class-validator
* Prisma or TypeORM

ORM choice will be finalized before database implementation.

### Frontend

Recommended stack:

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* React Router
* Fetch or Axios wrapper with credentials included

### AI and Vector

Initial options:

* OpenAI for reasoning
* local embedding model or OpenAI embedding
* pgvector for vector storage

Future options:

* local LLM
* hybrid reasoning
* Qdrant or Milvus for large-scale vector search

---

## API Versioning

DeployGuard uses route versioning.

Initial API prefix:

```txt
/api/v1
```

Examples:

```txt
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me

POST /api/v1/ingest/logs

GET  /api/v1/projects
GET  /api/v1/incidents
```

Versioning rule:

```txt
/api/v1 = stable contract
/api/v2 = breaking changes only
```

Adding optional response fields should not require a new API version.

---

## Strict Engineering Rules

DeployGuard must follow strict engineering rules.

Required:

* strict TypeScript
* no `any`
* no magic values
* env-driven configuration
* constants for domain values
* compile-safe migrations
* Prettier formatting
* clear module boundaries
* no half-refactor
* no function references before implementation
* no deleting functions before all callers are migrated
* no unsafe token storage
* no direct project access without backend authorization check

TypeScript rule:

```txt
No any.
Use explicit types.
Use unknown when input type is not trusted.
Use DTO/schema validation at boundaries.
```

---

## Suggested Repository Structure

Initial monorepo structure:

```txt
deployguard/
├── README.md
├── PRD.md
├── backend/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   └── postgres/
├── docs/
│   ├── architecture.md
│   ├── security.md
│   └── api-contract.md
└── docker-compose.yml
```

---

## Initial Data Model Draft

Core tables:

```txt
users
projects
project_memberships
roles
permissions
role_permissions
sessions
refresh_tokens
api_clients
api_keys
logs
log_embeddings
incidents
incident_embeddings
incident_logs
audit_logs
embedding_jobs
```

Important rules:

* logs belong to one project
* incidents belong to one project
* API keys are project-scoped
* project admins cannot access other projects
* refresh tokens are stored hashed
* sensitive values must be redacted
* embeddings must track model name and dimension

---

## MVP Scope

Initial MVP should include:

* local auth
* HttpOnly cookie session
* refresh token rotation
* Redis access token denylist
* project-scoped RBAC
* user management
* project management
* REST log ingestion
* PostgreSQL schema
* pgvector setup
* async embedding job
* semantic log search
* incident analysis
* dashboard profile restore
* project-scoped dashboard

OIDC can be added after local auth is stable.

GraphQL can be added after the initial REST read model becomes too fragmented.

---

## Phase Roadmap

### Phase 1

Repository baseline, README, PRD, architecture decisions.

### Phase 2

Backend and frontend project skeleton.

### Phase 3

Database setup with PostgreSQL, connection pooling, and migration strategy.

### Phase 4

Authentication foundation with local auth, HttpOnly cookies, refresh token rotation, and Redis denylist.

### Phase 5

Project-scoped RBAC and user management.

### Phase 6

Project management and ingestion credentials.

### Phase 7

REST log ingestion API.

### Phase 8

Background job queue with Redis and embedding worker.

### Phase 9

pgvector integration and semantic log search.

### Phase 10

Incident analysis and operational memory.

### Phase 11

Dashboard UI with Zustand auth state, project scope, metrics, incident history, and semantic search.

### Phase 12

Optional GraphQL dashboard read model.

### Phase 13

Dedicated vector DB migration preparation and benchmark.

---

## Development Principles

Each phase must include:

1. Problem being solved
2. Chosen solution
3. Trade-off
4. Files or modules changed
5. Implementation
6. Compile/test validation
7. Commit message

---

## Current Architecture Decisions

Locked decisions:

```txt
SameSite=Lax for initial cookie strategy
Strict TypeScript
No any
REST for ingestion
GraphQL optional for dashboard
PostgreSQL as primary relational DB
pgvector as initial vector storage
Redis for denylist and async jobs
Zustand for frontend global state
Project-scoped RBAC
OIDC optional
Local auth required
HttpOnly cookies for web auth
No token storage in localStorage
Manual single refresh lock
/api/v1 route versioning
```