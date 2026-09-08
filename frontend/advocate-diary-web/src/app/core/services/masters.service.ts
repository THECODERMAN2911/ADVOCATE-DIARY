import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MasterItem { id: number; name: string; isActive: boolean; }
export interface MasterSaveRequest { name: string; isActive: boolean; }
export interface Lookup { id: number; name: string; }

/** Generic client for the firm-owned masters (resource = 'courts' | 'case-types' | 'case-stages'). */
@Injectable({ providedIn: 'root' })
export class MastersService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  list(resource: string, includeInactive = false): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(`${this.api}/${resource}?includeInactive=${includeInactive}`);
  }
  create(resource: string, r: MasterSaveRequest): Observable<MasterItem> {
    return this.http.post<MasterItem>(`${this.api}/${resource}`, r);
  }
  update(resource: string, id: number, r: MasterSaveRequest): Observable<MasterItem> {
    return this.http.put<MasterItem>(`${this.api}/${resource}/${id}`, r);
  }
  remove(resource: string, id: number): Observable<unknown> {
    return this.http.delete(`${this.api}/${resource}/${id}`);
  }

  // Lookups
  states(): Observable<Lookup[]> { return this.http.get<Lookup[]>(`${this.api}/lookups/states`); }
  cities(stateId?: number): Observable<Lookup[]> {
    const q = stateId ? `?stateId=${stateId}` : '';
    return this.http.get<Lookup[]>(`${this.api}/lookups/cities${q}`);
  }
  salutations(): Observable<Lookup[]> { return this.http.get<Lookup[]>(`${this.api}/lookups/salutations`); }
}
