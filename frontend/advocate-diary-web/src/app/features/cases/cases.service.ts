import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CaseListItem {
  id: number;
  caseNumber: string;
  title: string;
  partyName?: string;
  nextDate?: string;
  isStarred: boolean;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CaseDetail extends CaseSaveRequest {
  id: number;
  isStarred: boolean;
  isActive: boolean;
}

export interface CaseSaveRequest {
  caseNumber: string;
  title: string;
  defendant?: string;
  courtId?: number;
  caseTypeId?: number;
  caseStageId?: number;
  appearingLawyerId?: number;
  filingDate?: string;
  previousDate?: string;
  nextDate?: string;
  partyName?: string;
  partyAddress?: string;
  partyZip?: number;
  partyPhone?: string;
  partyPhone2?: string;
  partyEmail?: string;
  oppositeLawyer?: string;
  feeAgreed: number;
  feeBalance: number;
  tags?: string;
  remarks?: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
}

export interface CaseHistoryItem { id: number; hearingDate: string; notes?: string; }

export type CaseFilter = 'Active' | 'Archived' | 'Starred';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/cases`;

  list(page: number, pageSize: number, query: string, filter: CaseFilter): Observable<PagedResult<CaseListItem>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize).set('filter', filter);
    if (query) params = params.set('query', query);
    return this.http.get<PagedResult<CaseListItem>>(this.base, { params });
  }

  get(id: number): Observable<CaseDetail> { return this.http.get<CaseDetail>(`${this.base}/${id}`); }
  create(r: CaseSaveRequest): Observable<CaseDetail> { return this.http.post<CaseDetail>(this.base, r); }
  update(id: number, r: CaseSaveRequest): Observable<CaseDetail> { return this.http.put<CaseDetail>(`${this.base}/${id}`, r); }

  star(id: number, value: boolean): Observable<unknown> { return this.http.put(`${this.base}/${id}/star?value=${value}`, {}); }
  archive(id: number, value: boolean): Observable<unknown> { return this.http.put(`${this.base}/${id}/archive?value=${value}`, {}); }

  history(id: number): Observable<CaseHistoryItem[]> { return this.http.get<CaseHistoryItem[]>(`${this.base}/${id}/notes`); }
  addNote(id: number, hearingDate: string, notes?: string): Observable<CaseHistoryItem> {
    return this.http.post<CaseHistoryItem>(`${this.base}/${id}/notes`, { hearingDate, notes });
  }
}
