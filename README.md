# DeployGuard

DeployGuard is an Operational Intelligence Platform for engineering teams.

It collects structured production logs and operational events from multiple projects, stores them securely, makes them searchable by semantic meaning, and helps engineers investigate incidents faster using historical context, semantic search, and AI-assisted RCA.

DeployGuard is not a ChatGPT wrapper.

DeployGuard is designed to become an operational memory layer for engineering teams.

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

DeployGuard solves this by turning operational history into searchable engineering memory.

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

Important rule:

A project admin automatically cannot access another project outside their assigned scope.

Examples:

* Realcast Admin cannot access DSN.
* DSN Admin cannot access Realcast.
* OneRoster Admin cannot access Realcast or DSN.

This restriction must be enforced by the backend, not only by frontend UI.

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

A project admin manages only assigned project scopes.

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

## Architecture Summary

Initial architecture:

```txt
External Applications
Realcast / DSN / OneRoster / LTI
        ↓
REST Ingestion API
        ↓
Validation & Normalization
        ↓
PostgreSQL
        ↓
Embedding Job Queue
        ↓
pgvector
        ↓
Semantic Search
        ↓
AI-Assisted RCA
        ↓
DeployGuard Dashboard
```

Initial backend strategy:

```txt
REST API:
- ingestion
- auth
- user management
- project management
- operational commands

GraphQL:
- optional dashboard read model
- optional semantic search exploration
- optional nested RCA query
```

GraphQL is not required in the first MVP. It should be introduced only when REST read endpoints become too fragmented or dashboard queries become deeply nested.

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
* Pino
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

## Repository Structure

Initial structure:

```txt
deployguard/
├── README.md
├── PRD.md
├── backend/
│   ├── src/
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

Important decision:

There is no root `.env.example`.

Environment files are separated by application:

```txt
backend/.env.example
frontend/.env.example
```

---

## Environment Variables

### Backend

File:

```txt
backend/.env.example
```

Example:

```env
NODE_ENV=development
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=deployguard
POSTGRES_PASSWORD=deployguard_password
POSTGRES_DB=deployguard
DATABASE_URL=postgresql://deployguard:deployguard_password@localhost:5432/deployguard

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

LOG_LEVEL=debug
LOG_PRETTY=true
LOG_FILE_ENABLED=true
LOG_FILE_PATH=logs/deployguard-api.log
```

### Frontend

File:

```txt
frontend/.env.example
```

Example:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

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

## Authentication Strategy

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

## Session Restore Flow

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

## RBAC Strategy

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

Important rule:

A project admin automatically cannot access another project outside their assigned scope.

---

## Multi-Tenant Strategy

DeployGuard is a project-scoped internal multi-tenant system.

Initial database strategy:

```txt
Single PostgreSQL database
Project isolation using project_id
Backend-enforced RBAC
```

DeployGuard will not use one database per project in the MVP.

Reason:

* simpler migration
* simpler backup
* simpler analytics
* simpler local development
* easier cross-project platform administration
* better MVP speed

Important tables must include `project_id` where relevant:

* logs
* incidents
* api_keys
* project_memberships
* log_embeddings
* incident_embeddings
* audit_logs
* embedding_jobs

Future option:

Multi-database isolation may be considered only if DeployGuard becomes an external SaaS product or if enterprise compliance requires physical tenant isolation.

---

## User Management

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

## REST API for Ingestion

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

## PostgreSQL

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

## Local PostgreSQL Setup

Current recommended local database credentials:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=deployguard
POSTGRES_PASSWORD=deployguard_password
POSTGRES_DB=deployguard
DATABASE_URL=postgresql://deployguard:deployguard_password@localhost:5432/deployguard
```

Create local role and database:

```bash
psql postgres
```

```sql
CREATE ROLE deployguard WITH LOGIN PASSWORD 'deployguard_password';
CREATE DATABASE deployguard OWNER deployguard;
```

Connect as application user:

```bash
psql -h localhost -p 5432 -U deployguard -d deployguard
```

---

## pgvector

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

## Local pgvector Setup Note

pgvector must be enabled once per database.

For local development, the extension may require a PostgreSQL superuser.

If normal database user fails with:

```txt
ERROR: permission denied to create extension "vector"
HINT: Must be superuser to create this extension.
```

Then enable the extension using a PostgreSQL superuser.

Example:

```bash
psql -d deployguard
```

Then run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

After the extension is created, the normal `deployguard` database user can use vector columns and vector queries.

Verify extension:

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';
```

Smoke test:

```sql
CREATE TABLE IF NOT EXISTS pgvector_smoke_test (
  id SERIAL PRIMARY KEY,
  embedding vector(3)
);

INSERT INTO pgvector_smoke_test (embedding)
VALUES
  ('[1,2,3]'),
  ('[1,1,1]');

SELECT
  id,
  embedding <-> '[1,2,3]'::vector AS l2_distance
FROM pgvector_smoke_test
ORDER BY l2_distance ASC;

DROP TABLE pgvector_smoke_test;
```

Expected result:

```txt
The row with embedding [1,2,3] should return distance 0 and appear first.
```

---

## Redis

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

## Logging

DeployGuard uses Pino for structured backend logging.

Reason:

DeployGuard is a log-heavy platform. It should have proper internal logging from the beginning.

Logging must cover:

* incoming request
* response status
* request duration
* error stack
* auth events
* RBAC denial
* ingestion accepted/rejected
* embedding job status
* vector search latency
* AI analysis latency
* external API failure
* database query failure

Sensitive values must not be logged.

Do not log:

* password
* password hash
* access token
* refresh token
* API key
* cookie
* authorization header
* raw secret value

Backend logging environment variables:

```env
LOG_LEVEL=debug
LOG_PRETTY=true
LOG_FILE_ENABLED=true
LOG_FILE_PATH=logs/deployguard-api.log
```

Development behavior:

```txt
LOG_PRETTY=true
LOG_FILE_ENABLED=true
```

Expected output:

* readable logs in terminal
* local log file at `backend/logs/deployguard-api.log`

Production behavior:

```txt
LOG_PRETTY=false
LOG_FILE_ENABLED=false
```

Expected output:

* structured JSON logs to stdout
* log collection handled by process manager, container runtime, or cloud logging

The `logs/` directory must be ignored by git.

---

## Log Rotation

If local file logging is enabled, the log file can grow continuously.

Example:

```txt
backend/logs/deployguard-api.log
```

Without rotation, the file can grow from MB to GB and eventually cause disk issues.

Log rotation means splitting logs into multiple files based on size or time.

Examples by time:

```txt
deployguard-api-2026-06-15.log
deployguard-api-2026-06-16.log
deployguard-api-2026-06-17.log
```

Examples by size:

```txt
deployguard-api.log
deployguard-api.1.log
deployguard-api.2.log
```

Retention example:

```txt
Keep only the last 7 days of logs.
Delete older logs automatically.
```

Initial decision:

Log rotation is not required for the current MVP development phase.

Future options:

* PM2 log rotation
* OS logrotate
* Pino rotation transport
* external log collector
* cloud logging

---

## Frontend UI Direction

Initial UI direction:

```txt
Default light mode
No dark mode by default
Dark/light toggle may be added later
```

The first dashboard should prioritize:

* clarity
* readability
* operational focus
* fast investigation
* project-scoped navigation

---

## Frontend State Management

DeployGuard uses Zustand for frontend global state.

Initial global state:

* authenticated user profile
* project access
* roles
* permissions
* selected project

Reason:

* lightweight
* simple API
* less boilerplate than Redux
* suitable for auth/profile state
* easy to use across dashboard components

---

## Docker Decision

Docker is optional during early development.

Reason:

The project is currently developed by one developer, so strict environment version matching across a team is not the main priority.

Initial strategy:

```txt
Phase 2:
No Docker required.

Phase 3+:
Use local PostgreSQL and Redis first.

If pgvector or Redis local setup becomes painful:
Docker can be introduced as a developer convenience.
```

Docker may still be useful later for:

* PostgreSQL + pgvector setup
* Redis setup
* production-like local testing
* deployment packaging
* onboarding future developers

But Docker is not mandatory for the initial MVP phase.

---

## NestJS CLI Usage

Use NestJS CLI to improve Developer Experience.

Generate module:

```bash
nest g module health
```

Generate controller:

```bash
nest g controller health
```

Generate service:

```bash
nest g service health
```

Short version:

```bash
nest g mo health
nest g co health
nest g s health
```

Generate full REST resource:

```bash
nest g resource projects
```

Use `resource` for domain CRUD modules such as:

* users
* projects
* logs
* incidents

Use manual module/service generation for infrastructure modules such as:

* database
* redis
* logging
* vector

---

## Local Development

### Backend

Install dependencies:

```bash
cd backend
npm install
```

Create env file:

```bash
cp .env.example .env
```

Run backend:

```bash
npm run start:dev
```

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "deployguard-api"
}
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Create env file:

```bash
cp .env.example .env
```

Run frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
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

### Phase 2.1

Structured backend logging with Pino and environment loading fix.

### Phase 2.2

Optional local file logging and pgvector setup notes.

### Phase 3

Database setup, ORM decision, PostgreSQL pooling, and migration strategy.

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
Single database with project_id isolation
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
Default light mode UI
Docker optional during early development
Pino for backend structured logging
Optional local file logging for development debugging
```
