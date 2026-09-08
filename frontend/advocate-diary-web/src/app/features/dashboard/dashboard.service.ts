import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../cases/cases.service';

export interface DashboardSummary {
  todayHearings: number;
  upcoming7Days: number;
  pendingDiary: number;
  activeCases: number;
  feeAgreedTotal: number;
  feeReceivedTotal: number;
  feeBalanceTotal: number;
}

export interface CaseReportRow {
  caseNumber: string;
  title: string;
  party?: string;
  nextDate?: string;
  feeAgreed: number;
  feeBalance: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  summary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.api}/dashboard/summary`);
  }

  casesReport(includeArchived: boolean, page: number, pageSize: number, query = ''): Observable<PagedResult<CaseReportRow>> {
    let params = new HttpParams()
      .set('includeArchived', includeArchived)
      .set('page', page)
      .set('pageSize', pageSize);
    if (query) params = params.set('query', query);
    return this.http.get<PagedResult<CaseReportRow>>(`${this.api}/reports/cases`, { params });
  }

  exportCases(includeArchived: boolean, query = ''): Observable<Blob> {
    let params = new HttpParams().set('includeArchived', includeArchived);
    if (query) params = params.set('query', query);
    return this.http.get(`${this.api}/reports/cases/export`, { params, responseType: 'blob' });
  }
}
