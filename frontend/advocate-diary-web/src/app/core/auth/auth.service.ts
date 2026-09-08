import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserSummary } from '../models/auth.models';

const ACCESS = 'ad_access';
const REFRESH = 'ad_refresh';
const USER = 'ad_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth`;

  private _user = signal<UserSummary | null>(this.readUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, req).pipe(tap((r) => this.store(r)));
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, req).pipe(tap((r) => this.store(r)));
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${this.base}/forgot`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<unknown> {
    return this.http.post(`${this.base}/reset`, { token, newPassword });
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/refresh`, { refreshToken: this.refreshToken })
      .pipe(tap((r) => this.store(r)));
  }

  logout(): void {
    const rt = this.refreshToken;
    if (rt) this.http.post(`${this.base}/logout`, { refreshToken: rt }).subscribe({ error: () => {} });
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
    this._user.set(null);
  }

  get accessToken(): string | null { return localStorage.getItem(ACCESS); }
  get refreshToken(): string | null { return localStorage.getItem(REFRESH); }

  private store(r: AuthResponse): void {
    localStorage.setItem(ACCESS, r.accessToken);
    localStorage.setItem(REFRESH, r.refreshToken);
    localStorage.setItem(USER, JSON.stringify(r.user));
    this._user.set(r.user);
  }

  private readUser(): UserSummary | null {
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as UserSummary) : null;
  }
}
