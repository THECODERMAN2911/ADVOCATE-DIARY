import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactRequest { name: string; email: string; phone?: string; subject?: string; message: string; }

@Injectable({ providedIn: 'root' })
export class PublicService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  contact(r: ContactRequest): Observable<unknown> { return this.http.post(`${this.api}/contact`, r); }
  refer(toEmail: string, fromName?: string, fromEmail?: string): Observable<unknown> {
    return this.http.post(`${this.api}/referrals`, { toEmail, fromName, fromEmail });
  }
}
