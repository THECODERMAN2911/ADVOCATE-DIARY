# Data Model — legacy entities → EF Core

16 entities exist in the legacy EDMX (`Law.Data/Law.edmx`). They map to EF Core as follows.
Strategy: **reverse-engineer** the existing SQL Server schema (`dotnet ef dbcontext scaffold`) so the new
API runs on the *same* database during transition, then evolve with additive migrations.

## Existing entities (keep)
| Legacy table | New entity | Module | Notes |
|---|---|---|---|
| Lawyer_Mstr | `User` (Lawyer) | M1 | login identity; belongs to a Firm |
| Firm_Mstr | `Firm` | M1 | tenant root |
| Salutaion_Mstr | `Salutation` | M2 | lookup (note legacy typo) |
| Court_Mstr | `Court` | M2 | master |
| CaseType_Mstr | `CaseType` | M2 | master |
| CaseStage_Mstr | `CaseStage` | M2 | master |
| City_Mstr | `City` | M2 | lookup |
| State_Mstr | `State` | M2 | lookup |
| Case_Mstr | `Case` | M3 | core aggregate |
| CaseHistory_Dtls | `CaseHistory` | M4 | hearing/notes history |
| CasePayment_Dtls | `CasePayment` | M6 | fee ledger |
| Plan_Mstr | `Plan` | M6 | subscription plan |
| License_Mstr | `License` | M6 | firm licence/subscription |
| Contact_MST | `ContactMessage` | M9 | contact-us submissions |
| RefFriend / RefFriends | `Referral` | M9 | de-dupe the two into one |

## New tables (additive migrations)
| Entity | Purpose |
|---|---|
| `RefreshToken` | JWT refresh tokens (rotating, revocable) — user, token hash, expiry, replacedBy |
| `Role`, `UserRole` | RBAC: FirmAdmin / Lawyer / Staff |
| `Document` | case document metadata (replaces raw `case_files` filesystem listing) |
| `NotificationLog` | email/SMS/WhatsApp delivery attempts + status |
| `AuditLog` | who/what/when for sensitive actions |

## Key relationships
- `Firm 1—* User` · `Firm 1—* Case` (tenant scoping via `FirmId`).
- `Case *—1 Court`, `*—1 CaseType`, `*—1 CaseStage`, `*—1 User (appearingLawyer)`.
- `Case 1—* CaseHistory` (hearings/notes) · `Case 1—* CasePayment` · `Case 1—* Document`.
- `Firm 1—* License *—1 Plan`.

## Reverse-engineering findings (live `adiary_test`, read-only scaffold)

The live schema was scaffolded (`dotnet ef dbcontext scaffold`) and differs from a clean model in ways that shape the strategy:

- **`Case_Mstr` has NO `FirmId`.** Tenancy is *indirect*: `Case_Mstr.LawyerID_FK → Lawyer_Mstr.FirmID_FK`.
- **No `IsArchived`** — the app uses `IsActive` (archived ≈ `IsActive = 0`).
- Legacy naming: `*_PK` / `*_FK` keys, `CourtName`/`FirmName` (not `Name`), `Address1`, `Salutaion` typo, `ModifedBy` typo in `CaseHistory_Dtls`.
- Modern concepts **absent from the legacy DB**: roles, refresh tokens, reset tokens, audit — these need NEW tables/columns.
- `Lawyer_Mstr.Password` is **plaintext**.

**Revised strategy (given the divergence):** the modern app runs on its **own clean database** (EF Core code-first migrations); a **one-time + delta data migration** maps legacy rows in. This is cleaner than dual-writing the exact legacy tables and lets the modern schema add roles/tokens/audit freely. The mapping below drives that migration.

### `Case_Mstr` → modern `Case` (real columns)
| Legacy column | Modern property |
|---|---|
| CaseID_PK | Id |
| CaseNumber | CaseNumber |
| Title / Defendant | Title / Defendant |
| CourtID_FK / CaseTypeID_FK / CaseStageID_FK | CourtId / CaseTypeId / CaseStageId |
| LawyerID_FK | AppearingLawyerId (→ Firm via lawyer) |
| PartyName / PartyAddress / PartyZip | PartyName / PartyAddress / PartyZip |
| PartyPhone1 / PartyPhone2 / PartyEmail1 | PartyPhone / PartyPhone2 / PartyEmail |
| OppositeLawyer / Remarks / Tags | OppositeLawyer / Remarks / Tags |
| FilingDate / PreviousDate / NextDate | FilingDate / PreviousDate / NextDate |
| FeeAgreed / FeeBalance | FeeAgreed / FeeBalance |
| SMS / Email | SmsOptIn / EmailOptIn (notify party) |
| IsStarred / IsActive | IsStarred / IsActive (archived = !IsActive) |
| ModifiedOn / ModifiedBy | UpdatedAt / (audit) |

> The scaffolded reference models live in the session scratchpad (`scaffold-inspect/Models`), not committed.

## Notes / clean-ups during scaffold
- Normalise legacy naming (`_Mstr`, `Salutaion` typo, `RefFriend`+`RefFriends` duplication) at the EF Core mapping layer while keeping physical column names via `[Column]` so the shared DB stays intact.
- Add `FirmId` global query filter on all tenant entities.
- Introduce concurrency tokens (`rowversion`) where the legacy app had lost-update risks (e.g. Case next-date edits).
