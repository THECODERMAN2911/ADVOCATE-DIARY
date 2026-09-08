# Migration Action Plan — Phase-wise

Legacy: ASP.NET WebForms (.NET Framework 4.8, EDMX/EF6, WCF mobile API) → Target: Angular 21 + PrimeNG + Tailwind / ASP.NET Core 8 Web API / EF Core / JWT.

**Scale (from legacy audit):** 40 `.aspx` screens, 16 domain entities, 13 mobile API operations, integrations for Email (Office 365), SMS, WhatsApp (Meta Graph), Payments (PayU/Stripe), reCAPTCHA, Excel (EPPlus) and PDF (iTextSharp).

---

## Guiding principles

1. **Strangler-fig cutover** — legacy stays live; each module is replaced only when the new one reaches parity.
2. **Ship a vertical slice each phase** — DB → API → Angular screen, tested end-to-end. No "big bang".
3. **Shared database during transition** — new API reads the *existing* SQL Server; new tables are additive (refresh tokens, roles, audit).
4. **API-first** — one REST API serves web + mobile (retires WCF).
5. **Parity first, then improve** — reproduce each screen's behaviour, then layer the "missing features" (dashboard, RBAC, notifications centre, reports).

---

## Modules (functional grouping of the 40 screens)

| # | Module | Legacy screens folded in |
|---|--------|--------------------------|
| M1 | **Identity & Access** | Register, forgotPassword, login (Default/Site.Master), UpdateProfile, Updatefirm, UserList |
| M2 | **Masters / Reference** | AddCourt (Courts + Case Types + Case Stages), City/State/Salutation lookups |
| M3 | **Cases** | Case, caseView, AllCase, LawAllCase, Search, Starred, Archieved, IncompleteDairy |
| M4 | **Diary & Calendar** | DayCase, PreviousCase, Notes (case history), Calender, CalenderFrame |
| M5 | **Documents** | PdfViewer + the `case_files` upload/list/download feature |
| M6 | **Billing & Subscriptions** | pricing, Package, paymentsummary, FeeRecived (Plan/License/Payment) |
| M7 | **Notifications** | Email / SMS / WhatsApp send + templates (currently scattered in code) |
| M8 | **Dashboard & Reports** | rpt + **NEW** dashboard/analytics/exports |
| M9 | **Public / Marketing** | Default, feature, pricing, ContactUS, FAQ(L), Help(L), Disclaimer, Privacy, thankyou, referfriend |
| — | *Dropped* | WebForm2 (scratch), `*-Original` duplicates, CalenderFrame (iframe hack) |

---

## Phases

### Phase 0 — Foundation & Setup  *(scaffolded in this repo)*
- Solution structure (Clean Architecture), Git, CI, coding standards, EditorConfig.
- **Backend:** ASP.NET Core 8 Web API; EF Core `DbContext` reverse-engineered from the live DB; JWT + refresh-token infrastructure; Serilog logging; global exception middleware; Swagger; CORS; FluentValidation; AutoMapper.
- **Frontend:** Angular 21 workspace; PrimeNG + Tailwind configured; app shell (topbar/sidebar); routing; auth guard; HTTP interceptors (bearer + auto-refresh); environment config.
- **Data:** connect to existing SQL Server; add additive migration for `RefreshTokens`, `Roles`, `UserRoles`, `AuditLog`.
- **Exit criteria:** empty-but-running web app that authenticates a seeded user against the real DB.

### Phase 1 — Identity & Access (M1)
- Login, JWT issue + refresh + logout/revoke; register (Lawyer + Firm); forgot/reset password (email link); change password.
- Roles: **FirmAdmin / Lawyer / Staff**; policy-based authorization; **tenant isolation by FirmID**.
- Screens: Login, Register, Forgot/Reset, My Profile, Firm Profile, Users (list/invite/deactivate).
- **Exit:** a firm admin can register, log in, manage users; all requests are firm-scoped.

### Phase 2 — Masters / Reference (M2)
- CRUD for Courts, Case Types, Case Stages; read for City/State/Salutation.
- Screens: Masters management (tabbed), typeahead lookups reused across the app.
- **Exit:** case dropdowns are backed by the new master APIs.

### Phase 3 — Cases (M3)  *(the core)*
- Case CRUD; list with server-side paging/sort/filter; view; star/unstar; archive; incomplete-diary queue; global search.
- Party details, appearing/opposite lawyer, fees, tags, remarks.
- Screens: Cases list, Add/Edit Case, Case view, Search, Starred, Archived, Incomplete.
- **Exit:** full case lifecycle works on new stack against live data.

### Phase 4 — Diary, Calendar & Notifications (M4 + M7)
- Next-hearing-date workflow + history/notes; today's cause list; previous cases; calendar (PrimeNG FullCalendar).
- Notification service: Email (Office 365), SMS, WhatsApp (Meta Graph) with **templates + delivery status + retry**; per-event opt-in.
- Screens: Day cases, Calendar, Case notes/history, Notification settings & log.
- **Exit:** changing a hearing date notifies the party and is logged; calendar reflects hearings.

### Phase 5 — Documents (M5)
- Replace filesystem `case_files/{lawyerId}/{caseId}/` with an abstracted `IFileStorage` (local disk now, Azure Blob/S3 later); upload, list, preview (PDF/image), download, delete; virus-scan hook; size/type validation.
- Screens: Case Documents tab, in-app PDF/image viewer.
- **Exit:** documents upload/preview without the permission fragility of the legacy path.

### Phase 6 — Billing & Subscriptions (M6)
- Plans, licenses, subscription state; payment gateways (PayU + Stripe); fees-received ledger per case; invoices.
- Screens: Pricing/Packages, Checkout, Subscription, Fees received.
- **Exit:** a firm can subscribe, pay, and see licence status; case fees tracked.

### Phase 7 — Dashboard & Reports (M8)
- **NEW** dashboard: today's hearings, upcoming, pending diary, fee collection KPIs.
- Reports + Excel/PDF export (server-side, replacing EPPlus/iTextSharp usage).
- Screens: Dashboard, Reports.
- **Exit:** landing screen after login is an actionable dashboard.

### Phase 8 — Public / Marketing site (M9)
- Landing, features, pricing, contact (reCAPTCHA), FAQ, help, legal, refer-a-friend.
- Option: keep as a separate lightweight Angular app or a headless CMS; SEO-friendly (SSR/Analog or prerender).
- **Exit:** public site served from new stack.

### Phase 9 — Mobile API parity, hardening & cutover
- Ensure REST endpoints cover all 13 legacy WCF operations; publish mobile API contract; retire WCF.
- Security review (JWT, RBAC, tenant isolation, OWASP), load/perf test, observability, data-migration dry runs, parallel run, **cutover**, decommission legacy.

---

## Cross-cutting workstreams (run across all phases)

- **Data migration:** reverse-engineer schema → validate → additive migrations → verification scripts; keep legacy + new on same DB until Phase 9.
- **Testing:** xUnit (unit) + WebApplicationFactory (integration) backend; Jest/Karma + Cypress/Playwright frontend; per-phase regression pack.
- **CI/CD:** build/test/lint on PR; containerize API; deploy pipelines (staging → prod).
- **Security:** secrets out of config into a vault/user-secrets; HTTPS/HSTS; rate limiting; audit log; input validation.
- **Observability:** Serilog + structured logs; health checks; request tracing.

---

## Suggested sequencing & effort (indicative)

| Phase | Focus | Rough effort |
|---|---|---|
| 0 | Foundation | 1–2 wk |
| 1 | Identity | 2–3 wk |
| 2 | Masters | 1 wk |
| 3 | Cases (core) | 3–4 wk |
| 4 | Diary/Calendar/Notify | 2–3 wk |
| 5 | Documents | 1–2 wk |
| 6 | Billing | 2–3 wk |
| 7 | Dashboard/Reports | 1–2 wk |
| 8 | Public site | 1–2 wk |
| 9 | Parity + cutover | 2–3 wk |

> Effort assumes one full-stack pair; parallelise M2/M5/M9 (independent) to compress the timeline.

Per-screen status is tracked in [02-screen-inventory.md](02-screen-inventory.md).
