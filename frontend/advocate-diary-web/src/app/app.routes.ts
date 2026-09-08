import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  // Public (no shell)
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then((m) => m.Register) },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },

  // Public marketing site (specific paths — matched before the empty-path shell route)
  { path: 'home', loadComponent: () => import('./features/public/landing').then((m) => m.Landing) },
  { path: 'features', loadComponent: () => import('./features/public/features').then((m) => m.Features) },
  { path: 'pricing', loadComponent: () => import('./features/public/pricing').then((m) => m.PublicPricing) },
  { path: 'contact', loadComponent: () => import('./features/public/contact').then((m) => m.Contact) },
  { path: 'faq', loadComponent: () => import('./features/public/faq').then((m) => m.Faq) },
  { path: 'privacy', loadComponent: () => import('./features/public/legal').then((m) => m.Privacy) },
  { path: 'disclaimer', loadComponent: () => import('./features/public/legal').then((m) => m.Disclaimer) },
  { path: 'thank-you', loadComponent: () => import('./features/public/legal').then((m) => m.ThankYou) },

  // Authenticated app (shell layout)
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'cases', loadComponent: () => import('./features/cases/cases-list').then((m) => m.CasesList) },
      { path: 'cases/new', loadComponent: () => import('./features/cases/case-form').then((m) => m.CaseForm) },
      { path: 'cases/:id/edit', loadComponent: () => import('./features/cases/case-form').then((m) => m.CaseForm) },
      { path: 'cases/:id', loadComponent: () => import('./features/cases/case-view').then((m) => m.CaseView) },
      { path: 'diary/today', loadComponent: () => import('./features/diary/today').then((m) => m.DiaryToday) },
      { path: 'diary/previous', loadComponent: () => import('./features/diary/previous').then((m) => m.DiaryPrevious) },
      { path: 'calendar', loadComponent: () => import('./features/diary/calendar').then((m) => m.CalendarView) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications-log').then((m) => m.NotificationsLog) },
      { path: 'subscription', loadComponent: () => import('./features/billing/subscription').then((m) => m.SubscriptionPage) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports').then((m) => m.Reports) },
      {
        path: 'masters',
        canActivate: [roleGuard(['FirmAdmin'])],
        loadComponent: () => import('./features/masters/masters-page').then((m) => m.MastersPage),
      },
      {
        path: 'settings/profile',
        loadComponent: () => import('./features/settings/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'settings/firm',
        canActivate: [roleGuard(['FirmAdmin'])],
        loadComponent: () => import('./features/settings/firm/firm-settings').then((m) => m.FirmSettings),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['FirmAdmin'])],
        loadComponent: () => import('./features/users/users-list').then((m) => m.UsersList),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
