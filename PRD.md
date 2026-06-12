# DeployGuard PRD

## 1. Product Name

DeployGuard

## 2. Product Vision

DeployGuard is an Operational Intelligence Platform for engineering teams. It helps teams collect production logs and operational events, search historical incidents semantically, preserve root cause knowledge, and reduce repeated investigation during production incidents.

DeployGuard is not a ChatGPT wrapper. It is a system that combines structured log ingestion, project-scoped access control, semantic search, incident memory, and AI-assisted RCA to help engineers understand production failures faster.

## 3. Core Problem

Engineering teams repeatedly lose operational knowledge.

When a production incident happens, engineers often need to manually inspect logs, search old chat messages, remember past incidents, or ask senior engineers who may no longer be available. Old bugs can reappear, root causes are forgotten, and the team wastes time investigating the same type of issue again.

The biggest problem is not the lack of logs. The biggest problem is that logs, incident history, RCA knowledge, and deployment context are fragmented and not searchable by meaning.

## 4. Target Users

### 4.1 Platform Admin

A platform admin manages DeployGuard globally.

Responsibilities:

* Create and manage projects
* Create and manage users
* Assign project access
* Assign user auth type: local or OIDC
* Manage global settings
* Manage integration credentials
* View all projects if explicitly allowed by system policy

### 4.2 Project Admin

A project admin manages one specific project scope only.

Examples:

* Realcast Admin
* DSN Admin
* OneRoster Admin

Important rule:

A project admin automatically cannot access projects outside their assigned scope.

For example:

* Realcast Admin cannot access DSN.
* DSN Admin cannot access Realcast.
* OneRoster Admin cannot access Realcast or DSN.

This restriction must be enforced by the backend, not only by frontend UI.

### 4.3 Engineer

An engineer investigates incidents and production issues within assigned projects.

Responsibilities:

* Search logs
* Analyze incidents
* View RCA summaries
* View similar historical incidents
* Review deployment-related events

### 4.4 Viewer

A viewer can only read dashboard data for assigned projects.

Responsibilities:

* View incidents
* View summaries
* View timelines
* View operational memory

### 4.5 Ingestion Client

An ingestion client is a system identity used by external applications to send logs or operational events to DeployGuard.

Examples:

* Realcast Web backend
* Realcast iOS crash reporter
* DSN backend
* OneRoster worker
* LTI service

## 5. Goals

### 5.1 Product Goals

* Centralize operational logs and events from multiple projects.
* Preserve incident knowledge as searchable operational memory.
* Provide semantic search over logs and incidents.
* Help engineers find similar historical incidents.
* Generate AI-assisted incident analysis and RCA.
* Reduce repeated investigation work.
* Reduce MTTR during production incidents.
* Support project-scoped RBAC.
* Support secure web authentication using HttpOnly cookies.
* Prepare vector storage to scale from pgvector to dedicated vector DB.

### 5.2 Engineering Goals

* Strict TypeScript.
* No `any`.
* Env-driven configuration.
* Compile-safe migrations.
* No hardcoded domain values.
* PostgreSQL with connection pooling.
* pgvector as initial vector storage.
* Vector repository abstraction to support future Qdrant, Milvus, or other dedicated vector databases.
* REST API for ingestion.
* GraphQL optional for dashboard, nested RCA query, and semantic exploration.
* Route versioning with `/api/v1`.

## 6. Non-Goals

DeployGuard will not initially:

* Replace existing observability platforms completely.
* Collect every debug log from every system.
* Become a general-purpose chatbot.
* Perform automatic production rollback.
* Support public multi-tenant SaaS billing in the first version.
* Provide mobile apps in the first version.
* Support every vector database from day one.
* Support WebSocket live monitoring in the first version unless required later.

## 7. Key Use Cases

### 7.1 Log Ingestion from Real Project

A production service sends structured logs to DeployGuard.

Example source systems:

* Realcast Web
* Realcast iOS
* DSN
* OneRoster
* LTI service

Flow:

1. Source application sends structured log/event to DeployGuard.
2. DeployGuard validates the payload.
3. DeployGuard normalizes the log.
4. DeployGuard stores raw and structured data.
5. DeployGuard queues embedding generation.
6. DeployGuard stores embedding into vector storage.
7. DeployGuard makes the log searchable by semantic meaning.

### 7.2 Incident Analysis

An engineer submits an incident query.

Flow:

1. Engineer enters query such as `iPad LTI opens browser instead of app`.
2. DeployGuard generates query embedding.
3. DeployGuard searches similar logs and incidents.
4. DeployGuard retrieves relevant context.
5. DeployGuard generates AI-assisted analysis.
6. DeployGuard stores the analysis as operational memory.

### 7.3 Similar Incident Search

An engineer wants to know whether a similar issue happened before.

Flow:

1. Engineer searches using natural language.
2. DeployGuard performs semantic search.
3. DeployGuard returns similar incidents with similarity score.
4. Engineer reviews previous RCA and solution.

### 7.4 Project-Scoped Dashboard

A Realcast admin opens DeployGuard dashboard.

Expected behavior:

* Realcast admin can only see Realcast project data.
* Realcast admin cannot see DSN, OneRoster, or other projects.
* The backend enforces this rule on every request.

### 7.5 User Profile and Session Restore

When the dashboard loads, the frontend calls `/api/v1/auth/me`.

Flow:

1. Browser sends HttpOnly access token cookie automatically.
2. Server validates token.
3. If valid, server returns user profile, project scopes, roles, and permissions.
4. Frontend stores profile in global state.
5. If access token is expired, frontend calls refresh endpoint.
6. If refresh token is valid, server rotates refresh token and issues new cookies.
7. Frontend retries profile request.
8. If refresh token is expired or revoked, user is redirected to login.

## 8. Functional Requirements

### 8.1 Authentication

DeployGuard must support:

* Local authentication.
* Optional OIDC authentication.
* Secure HttpOnly cookie-based web sessions.
* Access token expiry.
* Refresh token rotation.
* Logout that revokes server-side session or refresh token.
* Redis-based access token denylist.
* No token storage in localStorage or sessionStorage.

### 8.2 Authorization

DeployGuard must support:

* Project-scoped RBAC.
* Platform admin role.
* Project admin role.
* Engineer role.
* Viewer role.
* Ingestion client permission.
* Backend-enforced authorization.
* Permission data returned from `/api/v1/auth/me`.

Important rule:

Project admins automatically cannot access projects outside their assigned scope.

### 8.3 User Management

DeployGuard must support:

* Create user.
* Update user.
* Disable user.
* Assign auth type: local or OIDC.
* Assign project access.
* Assign project role.
* View user list.
* Audit user management actions.

### 8.4 Project Management

DeployGuard must support:

* Create project.
* Update project.
* Disable project.
* Manage project API credentials.
* Rotate ingestion credentials.
* View project-specific metrics.

### 8.5 Log Ingestion

DeployGuard must support:

* REST-based log ingestion.
* Versioned endpoint under `/api/v1`.
* Structured JSON payload.
* Payload validation.
* Request size limit.
* Rate limiting.
* Project credential validation.
* Store raw log.
* Store normalized log.
* Queue embedding generation.

Initial endpoint:

```txt
POST /api/v1/ingest/logs
```

### 8.6 Incident Management

DeployGuard must support:

* Create incident analysis.
* Store RCA result.
* Store retrieved logs.
* Store similar incident references.
* View incident history.
* View incident details.
* View incident timeline.
* Search incidents semantically.

### 8.7 Semantic Search

DeployGuard must support:

* Generate embeddings.
* Store embeddings in pgvector initially.
* Search similar logs.
* Search similar incidents.
* Filter search by project, environment, severity, service, and time range.
* Normalize similarity score.
* Abstract vector storage behind repository interface.

### 8.8 AI-Assisted RCA

DeployGuard must support:

* Retrieve relevant logs and historical incidents.
* Generate incident summary.
* Generate possible root cause analysis.
* Generate suggested next investigation steps.
* Save AI output as incident memory.
* Track model name and generation metadata.

### 8.9 Dashboard

DeployGuard dashboard must support:

* Login page.
* Authenticated layout.
* Project switcher.
* Metrics cards.
* Incident search.
* Incident analysis panel.
* Incident history table.
* Incident timeline.
* Operational memory dashboard.
* User management.
* Project management.
* Role and permission visibility.

## 9. Non-Functional Requirements

### 9.1 Security

DeployGuard must implement:

* HTTPS only.
* HttpOnly cookies.
* Secure cookies.
* SameSite cookie policy.
* CSRF protection.
* Origin/Referer validation.
* Strict CORS.
* Password hashing.
* Refresh token hashing.
* Refresh token rotation.
* Redis denylist for revoked access token IDs.
* Audit logs for admin actions.
* Input validation.
* Output sanitization.
* Secret redaction.
* Sensitive log masking.

### 9.2 Performance

DeployGuard must implement:

* PostgreSQL connection pooling.
* Query timeout.
* Worker concurrency limit.
* Async embedding job processing.
* Redis-backed queue for heavy jobs.
* Avoid synchronous AI reasoning in ingestion request path.
* Pagination for list endpoints.
* Indexes for project, timestamp, severity, service, and vector search.

### 9.3 Scalability

DeployGuard must support:

* Scaling API service horizontally.
* Scaling workers separately.
* Scaling vector storage from pgvector to dedicated vector DB.
* Project-based partitioning strategy.
* Time-based retention policy.
* Future dedicated vector DB such as Qdrant or Milvus.

### 9.4 Reliability

DeployGuard must support:

* Retry failed embedding jobs.
* Dead-letter queue for failed jobs.
* Idempotency key for ingestion.
* Structured error handling.
* Health check endpoint.
* Readiness check endpoint.
* Graceful shutdown.
* Database migration strategy.

### 9.5 Observability

DeployGuard must expose:

* API request logs.
* Worker job logs.
* Ingestion metrics.
* Embedding job metrics.
* AI analysis latency.
* Vector search latency.
* Error rate.
* Audit logs.

## 10. Recommended Architecture

### 10.1 Backend

Recommended stack:

* Node.js
* NestJS
* TypeScript
* PostgreSQL
* pgvector
* Redis
* BullMQ
* Zod or class-validator
* Prisma or TypeORM, final choice to be decided before implementation

### 10.2 Frontend

Recommended stack:

* React
* TypeScript
* Vite
* TailwindCSS
* Zustand
* React Router
* Fetch or Axios wrapper with credentials included

### 10.3 Database

Primary relational database:

* PostgreSQL

Initial vector storage:

* pgvector

Future vector storage:

* Qdrant, Milvus, or other dedicated vector database through repository abstraction

### 10.4 API Strategy

REST:

* Ingestion
* Authentication
* User management
* Project management
* Operational commands

GraphQL:

* Optional dashboard read model
* Semantic exploration
* Nested incident/RCA query

### 10.5 Authentication Strategy

Human users:

* Local auth
* Optional OIDC

System clients:

* Project API key
* Future OAuth2 client credentials

Session strategy:

* HttpOnly access token cookie
* HttpOnly refresh token cookie
* Refresh token rotation
* Redis access token denylist
* Server-side session table

## 11. Suggested Data Model

### 11.1 Core Tables

* users
* projects
* project_memberships
* roles
* permissions
* role_permissions
* sessions
* refresh_tokens
* api_clients
* api_keys
* logs
* log_embeddings
* incidents
* incident_embeddings
* incident_logs
* audit_logs
* embedding_jobs

### 11.2 Important Data Rules

* Project access must be enforced by backend.
* Logs must belong to one project.
* Incidents must belong to one project.
* API keys must be project-scoped.
* Refresh tokens must be stored hashed.
* Sensitive log values must be redacted before AI processing.
* Embeddings must track model name and dimension.

## 12. Initial MVP Scope

The first MVP should include:

* Local auth.
* HttpOnly cookie session.
* Refresh token rotation.
* Project-scoped RBAC.
* User management.
* Project management.
* REST log ingestion.
* PostgreSQL schema.
* pgvector integration.
* Basic embedding worker.
* Semantic log search.
* Incident analysis.
* Dashboard with metrics, search, history, and memory.

OIDC can be added after local auth is stable.

GraphQL can be added after REST read endpoints become too fragmented or nested dashboard queries become painful.

## 13. Open Questions

* Which ORM will be used: Prisma or TypeORM?
* Which embedding model will be used first?
* Will AI reasoning use OpenAI, local LLM, or hybrid?
* What log retention period is required?
* What severity classification rules are needed?
* What is the expected ingestion volume per project?
* Will deployments be integrated directly, or only logs/events?
* Should WebSocket or SSE be added for live incident dashboard?

## 14. Success Metrics

DeployGuard is successful if:

* Engineers can find similar historical incidents within seconds.
* RCA history is preserved and reusable.
* Repeated investigation time is reduced.
* Project admins cannot access data outside their scope.
* Production log ingestion is reliable.
* AI analysis is grounded in retrieved logs and incidents.
* The system can evolve from pgvector to dedicated vector DB without rewriting business logic.

## 15. Phase 1 Readiness Checklist

Before starting implementation:

* Confirm backend framework.
* Confirm ORM.
* Confirm PostgreSQL + pgvector setup.
* Confirm Redis usage.
* Confirm auth/session strategy.
* Confirm RBAC model.
* Confirm initial API contract.
* Confirm frontend state management.
* Confirm deployment environment.
* Confirm coding rules.

## 16. Initial Commit Message

chore(product): add DeployGuard PRD