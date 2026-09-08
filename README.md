# Advocate Diary — Modern Rebuild

Migration of the legacy **ASP.NET WebForms** app (`../law`) to a modern stack.

| Layer | Technology |
|---|---|
| Frontend | **Angular 21** + **PrimeNG** + **Tailwind CSS** |
| Backend | **ASP.NET Core 8 Web API** (Clean Architecture) |
| Database | **SQL Server** + **Entity Framework Core** |
| Auth | **JWT access token + refresh token**, role-based (FirmAdmin / Lawyer / Staff) |

## Repository layout

```
advocate-diary-modern/
├── README.md                     ← you are here
├── docs/
│   ├── 01-migration-action-plan.md   ← phased plan (READ THIS FIRST)
│   ├── 02-screen-inventory.md        ← every legacy screen → new module/route/API
│   ├── 03-architecture.md            ← target architecture & conventions
│   └── 04-data-model.md              ← 16 entities → EF Core
├── backend/
│   └── AdvocateDiary.sln
│       ├── src/AdvocateDiary.Domain/          entities, enums (no dependencies)
│       ├── src/AdvocateDiary.Application/      DTOs, service interfaces, use-cases
│       ├── src/AdvocateDiary.Infrastructure/   EF Core DbContext, repositories, JWT, email/sms
│       └── src/AdvocateDiary.Api/              controllers, middleware, Program.cs
└── frontend/
    └── advocate-diary-web/          Angular 21 workspace (PrimeNG + Tailwind)
```

## Migration approach (summary)

- **Strangler pattern** — the new app is stood up alongside the legacy site; modules cut over one phase at a time. The legacy app keeps running until each module reaches parity.
- **Database-first, gradually code-first** — the new backend points at the *existing* SQL Server schema (reverse-engineered into EF Core) so both apps can run against the same data during transition; new tables (refresh tokens, audit, roles) are added via EF Core migrations.
- **API-first** — one REST API serves both the Angular web app and the existing mobile clients (replacing the WCF `Law.MobileAPI`).
- **Vertical slices** — each module is delivered end-to-end (DB → API → Angular screen) before moving on, so every phase ships working software.

## Status — all 9 phases implemented (both apps build green)

| Phase | Module | Status |
|---|---|---|
| 0 | Foundation (Clean Arch, JWT+refresh, PrimeNG/Tailwind shell) | ✅ |
| 1 | Identity & Access (register, login, forgot/reset, users, roles, firm) | ✅ |
| 2 | Masters (courts / case types / stages + lookups) | ✅ |
| 3 | Cases (CRUD, list/filter, view, star/archive, history) | ✅ |
| 4 | Diary, Calendar & Notifications (SMTP + delivery log) | ✅ |
| 5 | Documents (IFileStorage, upload/preview/download) | ✅ |
| 6 | Billing & Subscriptions (plans, checkout, fee ledger) | ✅ |
| 7 | Dashboard & Reports (KPIs + Excel export) | ✅ |
| 8 | Public / Marketing site | ✅ |
| 9 | Mobile API parity, EF migrations, cutover guide | ✅ |

- Every legacy screen is mapped in [docs/02-screen-inventory.md](docs/02-screen-inventory.md) (all ☑ / ◐).
- EF Core `InitialCreate` migration generated (20 tables, plans seeded).
- Cutover, data-migration and security guide: [docs/05-cutover.md](docs/05-cutover.md).
- Full roadmap: [docs/01-migration-action-plan.md](docs/01-migration-action-plan.md).

> Remaining before production: real SMTP + payment-gateway keys, run the data migration against a staging copy, and the security-checklist items in the cutover guide.

## Run (once scaffolding is restored/installed)

```bash
# Backend
cd backend
dotnet restore
dotnet run --project src/AdvocateDiary.Api        # https://localhost:7080, Swagger at /swagger

# Frontend
cd frontend/advocate-diary-web
npm install
npm start                                          # http://localhost:4200
```
