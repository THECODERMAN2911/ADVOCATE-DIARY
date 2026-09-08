# Target Architecture

## Backend — ASP.NET Core 8, Clean Architecture

```
AdvocateDiary.Api            HTTP layer: controllers, middleware, auth, Swagger, DI wiring
        │  depends on
AdvocateDiary.Application     use-cases/services, DTOs, validators, mapping, interfaces
        │  depends on
AdvocateDiary.Domain          entities, value objects, enums  (no external deps)
        ▲  implemented by
AdvocateDiary.Infrastructure  EF Core DbContext, repositories, JWT, email/SMS/WhatsApp, file storage
```

- **Dependency rule:** dependencies point inward. `Domain` knows nothing; `Infrastructure` and `Api` depend on abstractions in `Application`.
- **Multi-tenancy:** every tenant-owned entity carries `FirmId`; a global EF Core query filter + the authenticated user's `FirmId` claim enforce isolation automatically.
- **Auth:** JWT access token (short-lived, ~15 min) + rotating **refresh token** (persisted, revocable). Roles as claims; policy-based `[Authorize]`.
- **Cross-cutting:** Serilog structured logging, global `ProblemDetails` exception middleware, FluentValidation, AutoMapper, rate limiting, CORS (Angular origin), health checks, Swagger/OpenAPI.
- **Data:** EF Core against the **existing SQL Server**; reverse-engineer current tables; additive migrations for new tables (`RefreshTokens`, `Roles`, `UserRoles`, `AuditLog`, `NotificationLog`, `Documents`).

### API conventions
- REST resources, plural nouns: `/api/cases`, `/api/courts`, `/api/auth/login`.
- Paged list envelope: `{ items, page, pageSize, totalCount }`.
- Errors: RFC 7807 `ProblemDetails`.
- Versioned: `/api/v1/...`.

## Frontend — Angular 21 + PrimeNG + Tailwind

```
src/app/
├── core/            singletons: auth service, JWT + refresh interceptors, guards, api base
├── shared/          reusable UI, pipes, directives, PrimeNG wrappers
├── layout/          shell: topbar, sidebar, breadcrumbs
└── features/        one folder per module (lazy-loaded, standalone components)
    ├── auth/  dashboard/  cases/  diary/  calendar/  documents/
    ├── masters/  billing/  users/  settings/  public/
```

- **Standalone components + lazy routes** per feature module.
- **State:** Angular signals for local/component state; a light store (signals-based service) per feature; RxJS for HTTP.
- **Styling:** Tailwind utilities + PrimeNG components (Aura theme). Tailwind `preflight` disabled to avoid clashing with PrimeNG base styles.
- **Auth:** `authInterceptor` attaches bearer; `refreshInterceptor` transparently renews on 401 and retries; `authGuard`/`roleGuard` protect routes.
- **Forms:** typed reactive forms; PrimeNG inputs; validation messages from API `ProblemDetails`.

## Environments
- `dev` → API `https://localhost:7080`, Angular `http://localhost:4200`.
- Config via `environment.ts` (frontend) and `appsettings.{env}.json` + user-secrets/vault (backend).
