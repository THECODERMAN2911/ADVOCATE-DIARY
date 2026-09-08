import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CaseDocument {
  id: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private http = inject(HttpClient);
  private base(caseId: number) { return `${environment.apiBaseUrl}/cases/${caseId}/documents`; }

  list(caseId: number): Observable<CaseDocument[]> {
    return this.http.get<CaseDocument[]>(this.base(caseId));
  }

  upload(caseId: number, file: File): Observable<CaseDocument> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<CaseDocument>(this.base(caseId), form);
  }

  delete(caseId: number, docId: number): Observable<unknown> {
    return this.http.delete(`${this.base(caseId)}/${docId}`);
  }

  /** Downloads through the auth interceptor (bearer token) as a blob. */
  download(caseId: number, docId: number): Observable<Blob> {
    return this.http.get(`${this.base(caseId)}/${docId}/download`, { responseType: 'blob' });
  }
}
