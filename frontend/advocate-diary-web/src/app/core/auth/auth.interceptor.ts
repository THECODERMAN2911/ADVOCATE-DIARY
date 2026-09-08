import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let refreshing = false;
const refreshed$ = new BehaviorSubject<string | null>(null);

/** Attaches the bearer token and transparently refreshes it on a 401, then retries once. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const withToken = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  return next(withToken(auth.accessToken)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall || !auth.refreshToken) {
        return throwError(() => err);
      }

      if (refreshing) {
        // wait for the in-flight refresh, then retry
        return refreshed$.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((t) => next(withToken(t))),
        );
      }

      refreshing = true;
      refreshed$.next(null);
      return auth.refresh().pipe(
        switchMap((r) => {
          refreshing = false;
          refreshed$.next(r.accessToken);
          return next(withToken(r.accessToken));
        }),
        catchError((e) => {
          refreshing = false;
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => e);
        }),
      );
    }),
  );
};
