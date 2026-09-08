# Phase 9 — Mobile API Parity, Migrations & Cutover

## 1. Mobile API parity (legacy WCF `IMobil` → new REST)

All 13 legacy WCF operations are covered by the REST API (one API now serves web + mobile; the WCF `Law.MobileAPI` is retired).

| Legacy WCF operation | New REST endpoint |
|---|---|
| `AuthenticateUser` | `POST /api/v1/auth/login` (JWT + refresh) |
| `GetFirm` | `GET /api/v1/firm` |
| `AddCase` | `POST /api/v1/cases` |
| `GetCaseDetails` | `GET /api/v1/cases/{id}` |
| `AddNextDate` | `PUT /api/v1/cases/{id}` (sets NextDate; triggers notification) |
| `MakeCaseStarredandUnStarred` | `PUT /api/v1/cases/{id}/star?value=` |
| `AddNotes` | `POST /api/v1/cases/{id}/notes` |
| `AddPayment` | `POST /api/v1/cases/{id}/fees` |
| `AddCourtOf` | `POST /api/v1/courts` |
| `AddCaseType` | `POST /api/v1/case-types` |
| `AddCaseStage` | `POST /api/v1/case-stages` |
| `SendEmailonDateChanged` | automatic in `PUT /cases/{id}` via `NotificationService` (email) |
| `SendMessageonNextDateChanged` | automatic in `PUT /cases/{id}` via `NotificationService` (SMS — gateway stubbed) |

Mobile clients switch base URL to the REST API and use the JWT bearer flow. Publish the OpenAPI/Swagger doc as the contract.

## 2. Database strategy

The modern app runs on its **own clean schema** created by EF Core migrations (`InitialCreate` — 20 tables, plans seeded). This was chosen over dual-writing the legacy tables because the legacy schema diverges (no `FirmId` on cases, `*_Mstr` naming) and the modern app adds concepts the legacy DB lacks (roles, refresh/reset tokens, audit, notification log, documents).

Create / update the schema:
```bash
cd backend
dotnet ef database update --project src/AdvocateDiary.Infrastructure --startup-project src/AdvocateDiary.Api
```
(Or the app can apply migrations on startup in non-prod.)

## 3. Data migration (legacy `adiary_test` → new)

One-time ETL, then an optional delta before cutover. Mapping is in [04-data-model.md](04-data-model.md). Order respects FK dependencies:

1. `Firm_Mstr` → `Firms`
2. `Lawyer_Mstr` → `Users` (map `Password` → `PasswordHash`; **passwords upgrade to BCrypt on first login** automatically; assign `Role` = FirmAdmin for the firm's primary user, else Lawyer)
3. `Court_Mstr` / `CaseType_Mstr` / `CaseStage_Mstr` → `Courts` / `CaseTypes` / `CaseStages` (carry `FirmId`)
4. `Case_Mstr` → `Cases` (set `FirmId` from the case's lawyer's firm; `IsActive`; map `SMS`/`Email` → `SmsOptIn`/`EmailOptIn`)
5. `CaseHistory_Dtls` → `CaseHistories`
6. `CasePayment_Dtls` → `CasePayments` (then recompute `Case.FeeBalance`)
7. `Plan_Mstr` / `License_Mstr` → `Plans` / `Licenses`
8. `Contact_MST` / `RefFriend(s)` → `ContactMessages` / `Referrals`
9. Case documents: copy `httpdocs/case_files/{lawyerId}/{caseId}/*` into the new `IFileStorage` root and insert `Documents` metadata rows.

Recommended tooling: a one-off .NET console (reuses the scaffolded legacy model + the new DbContext) or SQL `INSERT ... SELECT`. **Run against a staging copy first and verify row counts + spot-check.**

## 4. Security review checklist (pre-go-live)

- [ ] Move secrets out of `appsettings.json` → user-secrets / Key Vault (JWT `SigningKey`, DB, SMTP, gateway keys).
- [ ] Strong random JWT `SigningKey` (≥ 32 bytes); short access-token TTL + rotating refresh (already implemented).
- [ ] HTTPS/HSTS enforced; secure CORS origins (no wildcard).
- [ ] Rate limiting on `/auth/*` and public endpoints; lockout on repeated failures.
- [ ] Verify tenant isolation (firm query filters) on every endpoint; add integration tests.
- [ ] File upload: type/size validation (done) + antivirus scan hook before go-live.
- [ ] Configure real SMTP (`Email:*`) and payment gateway (replace `StubPaymentGateway`).
- [ ] Turn off detailed errors in production; return `ProblemDetails`.
- [ ] Add audit logging for sensitive actions (login, user/role changes, deletes).

## 5. Go-live steps

1. Provision prod DB; `dotnet ef database update`.
2. Deploy API (containerised) behind HTTPS; configure secrets, CORS, SMTP, gateway.
3. Build & deploy Angular (`npm run build` → static host / CDN); point `environment.apiBaseUrl` at prod API.
4. Run data migration (staging → verify → prod); freeze legacy writes during final delta.
5. Smoke test: login, dashboard, add/edit case, upload doc, hearing-date change + notification, reports export.
6. Cut DNS / switch users to the new app; keep legacy read-only as a fallback for one cycle.
7. Point `/` at the marketing landing for anonymous visitors (one route tweak); retire legacy WebForms + WCF.

## 6. Post-cutover

- Decommission legacy IIS site + WCF service.
- Enable SMS/WhatsApp gateways (finish M7).
- Add automated backups, monitoring/alerting, and CI/CD if not already in place.
