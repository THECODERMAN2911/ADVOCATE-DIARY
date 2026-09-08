import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CaseListItem, PagedResult } from '../cases/cases.service';

export interface NotificationLog {
  id: number;
  caseId?: number;
  channel: string;
  status: string;
  recipient: string;
  subject?: string;
  error?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DiaryService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  causeList(date?: string): Observable<CaseListItem[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<CaseListItem[]>(`${this.api}/diary/cause-list`, { params });
  }

  // Overdue hearings only grow over a firm's lifetime, so this is server-paginated —
  // never request the whole list.
  previous(page: number, pageSize: number, query = ''): Observable<PagedResult<CaseListItem>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (query) params = params.set('query', query);
    return this.http.get<PagedResult<CaseListItem>>(`${this.api}/diary/previous`, { params });
  }

  exportPrevious(query = ''): Observable<Blob> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    return this.http.get(`${this.api}/reports/previous/export`, {
      params,
      responseType: 'blob',
    });
  }

  calendar(from: string, to: string): Observable<CaseListItem[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<CaseListItem[]>(`${this.api}/diary/calendar`, { params });
  }

  notificationLog(): Observable<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(`${this.api}/notifications/log`);
  }
}
