import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, FirmDto, UpdateUserRequest, UserDto } from '../models/identity.models';

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  // Users (FirmAdmin)
  listUsers(): Observable<UserDto[]> { return this.http.get<UserDto[]>(`${this.api}/users`); }
  createUser(r: CreateUserRequest): Observable<UserDto> { return this.http.post<UserDto>(`${this.api}/users`, r); }
  updateUser(id: number, r: UpdateUserRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/users/${id}`, r);
  }

  // Me
  getMe(): Observable<UserDto> { return this.http.get<UserDto>(`${this.api}/me`); }
  updateProfile(r: { fullName: string; phone?: string }): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.api}/me`, r);
  }
  changePassword(currentPassword: string, newPassword: string): Observable<unknown> {
    return this.http.post(`${this.api}/me/change-password`, { currentPassword, newPassword });
  }

  // Firm
  getFirm(): Observable<FirmDto> { return this.http.get<FirmDto>(`${this.api}/firm`); }
  updateFirm(r: Omit<FirmDto, 'id' | 'logoPath'>): Observable<FirmDto> {
    return this.http.put<FirmDto>(`${this.api}/firm`, r);
  }
}
