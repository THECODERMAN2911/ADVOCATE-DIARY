# Screen Inventory & Mapping (all 40 legacy screens)

Legend — **Status:** ☐ not started · ◐ in progress · ☑ done · ✖ dropped.
Every legacy `.aspx` is accounted for. "New route" = Angular path; "API" = primary REST resource.

## M1 — Identity & Access  *(Phase 1 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| Default.aspx (login part) | `/login` | `POST /auth/login`, `/auth/refresh` | ☑ | JWT + refresh + auto-renew interceptor |
| Register.aspx | `/register` | `POST /auth/register` | ☑ | Lawyer + Firm signup (creates FirmAdmin) |
| forgotPassword.aspx | `/forgot-password`, `/reset-password` | `POST /auth/forgot`, `/auth/reset` | ☑ | one-time token, email stub (SMTP in Phase 4) |
| UpdateProfile.aspx | `/settings/profile` | `GET/PUT /me`, `POST /me/change-password` | ☑ | profile + change password |
| Updatefirm.aspx | `/settings/firm` | `GET/PUT /firm` | ☑ | firm profile (FirmAdmin); logo upload → Phase 5 |
| UserList.aspx | `/users` | `GET/POST/PUT /users` | ☑ | create/edit, roles, activate/deactivate (FirmAdmin) |

## M2 — Masters / Reference  *(Phase 2 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| AddCourt.aspx | `/masters` (Courts tab) | `CRUD /courts` | ☑ | tabbed page; generic CRUD; soft-delete |
| (embedded) Case Types | `/masters` (Case Types tab) | `CRUD /case-types` | ☑ | reusable master-crud component |
| (embedded) Case Stages | `/masters` (Case Stages tab) | `CRUD /case-stages` | ☑ | |
| (lookups) City/State/Salutation | — (typeahead) | `GET /lookups/{states,cities,salutations}` | ☑ | read-only; ready for Cases form |

## M3 — Cases (core)  *(Phase 3 — DONE, builds green; on real Case_Mstr field set)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| AllCase.aspx / LawAllCase.aspx | `/cases` | `GET /cases` (paged/filtered) | ☑ | merged; server-side paging + filter |
| Case.aspx | `/cases/new`, `/cases/{id}/edit` | `POST/PUT /cases` | ☑ | full form wired to master dropdowns |
| caseView.aspx | `/cases/{id}` | `GET /cases/{id}`, `GET/POST /cases/{id}/notes` | ☑ | detail + hearing history + add note |
| Search.aspx | `/cases` (search box) | `GET /cases?query=` | ☑ | folded into list |
| Starred.aspx | `/cases` (Starred filter) | `PUT /cases/{id}/star` | ☑ | star toggle |
| Archieved.aspx | `/cases` (Archived filter) | `PUT /cases/{id}/archive` | ☑ | archive = IsActive=false |
| IncompleteDairy.aspx | `/cases?incomplete` | `GET /cases` | ◐ | diary queue → refine in Phase 4 |

## M4 — Diary & Calendar  *(Phase 4 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| DayCase.aspx | `/diary/today` | `GET /diary/cause-list` | ☑ | today's cause list |
| PreviousCase.aspx | `/diary/previous` | `GET /diary/previous` | ☑ | overdue hearings |
| Notes.aspx | `/cases/{id}` (history panel) | `GET/POST /cases/{id}/notes` | ☑ | done in Phase 3 |
| Calender.aspx | `/calendar` | `GET /diary/calendar` | ☑ | inline datepicker → day list |
| CalenderFrame.aspx | — | — | ✖ | iframe hack, not needed |

## M7 — Notifications  *(Phase 4 — DONE, builds green)*
| Feature | New route | API | Status | Notes |
|---|---|---|---|---|
| Email / SMS / WhatsApp send | `/notifications` | `GET /notifications/log` | ☑(email) ◐(sms/wa) | real O365 SMTP; notify on next-date change; delivery log; SMS/WhatsApp stubbed |

## M5 — Documents  *(Phase 5 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| PdfViewer.aspx | case view → Documents panel | `GET /cases/{id}/documents/{doc}/download` | ☑ | authenticated blob download |
| case_files feature | case view → Documents panel | `GET/POST/DELETE /cases/{id}/documents` | ☑ | `IFileStorage` (local, cloud-swappable); type+size validation; path-traversal guard |

## M6 — Billing & Subscriptions  *(Phase 6 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| pricing.aspx / Package.aspx | `/subscription` | `GET /plans`, `GET /subscription` | ☑ | plans + current status |
| paymentsummary.aspx | `/subscription` (checkout) | `POST /subscription/checkout`, `/confirm` | ☑ | `IPaymentGateway` stub; PayU/Stripe-ready |
| FeeRecived.aspx | case view → Fees panel | `GET/POST/DELETE /cases/{id}/fees`, `/fees/summary` | ☑ | ledger; auto-recomputes FeeBalance |
| paymentsummary-Original.aspx | — | — | ✖ | duplicate |

## M7 — Notifications
| Feature (was code, not a screen) | New route | API | Status | Notes |
|---|---|---|---|---|
| Email / SMS / WhatsApp send | `/settings/notifications` | `GET/PUT /notification-settings`, `GET /notification-log` | ☐ | templates + delivery status + retry |

## M8 — Dashboard & Reports  *(Phase 7 — DONE, builds green)*
| Legacy screen | New route | API | Status | Notes |
|---|---|---|---|---|
| rpt.aspx | `/reports` | `GET /reports/cases`, `/cases/export` | ☑ | cases report + **Excel (.xlsx)** export via ClosedXML |
| **(NEW) Dashboard** | `/dashboard` | `GET /dashboard/summary` | ☑ | today/upcoming/pending/active + fee KPIs, clickable |

## M9 — Public / Marketing  *(Phase 8 — DONE, builds green)*
| Legacy screen | New route | Status | Notes |
|---|---|---|---|
| Default.aspx (landing) | `/home` | ☑ | hero + highlights (shared PublicChrome) |
| feature.aspx | `/features` | ☑ | |
| pricing.aspx | `/pricing` | ☑ | public `GET /plans` |
| ContactUS.aspx | `/contact` | ☑ | `POST /contact`; reCAPTCHA hook ◐ |
| FAQ.aspx / FAQL.aspx | `/faq` | ☑ | merged |
| Help.aspx / HelpL.aspx | `/faq` | ◐ | folded into FAQ; dedicated Help optional |
| Disclaimer.aspx | `/disclaimer` | ☑ | |
| Privacy.aspx | `/privacy` | ☑ | |
| thankyou.aspx | `/thank-you` | ☑ | |
| referfriend.aspx | (`POST /referrals`) | ☑(api) ◐(ui) | backend done; UI can reuse contact form |
| feature-Original.aspx | — | ✖ | duplicate |

> Note: `/` still routes to the app (→ login when anonymous). Landing is at `/home`; pointing `/` at the landing for anonymous visitors is a one-line cutover tweak.

## System / dropped
| Legacy screen | Disposition |
|---|---|
| Error.aspx | replaced by SPA error routes + API `ProblemDetails` |
| WebForm2.aspx | ✖ scratch/test page |

---

## Net-new features to add during migration (not in legacy)
- **Dashboard** with actionable KPIs (legacy has no real home dashboard).
- **Role-based access control** (FirmAdmin/Lawyer/Staff) + **tenant isolation** by firm.
- **Refresh-token auth**, proper password-reset, account lockout.
- **Notifications centre** — unified email/SMS/WhatsApp with templates, delivery status, retries.
- **Document management** — storage abstraction (cloud-ready), preview, validation, no filesystem-permission fragility.
- **Reports & analytics** with exports.
- **Global search** and saved filters.
- **Audit log** of sensitive actions.
- **Responsive, accessible, mobile-first UI** (PrimeNG + Tailwind).
- **Unified REST API** for web + mobile (retires the WCF service).
