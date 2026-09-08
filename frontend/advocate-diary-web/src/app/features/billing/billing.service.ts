import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Plan { id: number; name: string; description?: string; price: number; durationDays: number; }
export interface Subscription {
  hasSubscription: boolean;
  planName?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  daysRemaining?: number;
}
export interface CheckoutResponse { paymentId: number; gateway: string; redirectUrl: string; }
export interface CasePayment { id: number; amount: number; paidOn: string; mode?: string; notes?: string; }
export interface FeeSummary { feeAgreed: number; totalReceived: number; balance: number; }

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  plans(): Observable<Plan[]> { return this.http.get<Plan[]>(`${this.api}/plans`); }
  subscription(): Observable<Subscription> { return this.http.get<Subscription>(`${this.api}/subscription`); }
  checkout(planId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.api}/subscription/checkout`, { planId });
  }
  confirm(paymentId: number): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.api}/subscription/confirm`, { paymentId });
  }

  // Case fees ledger
  fees(caseId: number): Observable<CasePayment[]> { return this.http.get<CasePayment[]>(`${this.api}/cases/${caseId}/fees`); }
  feeSummary(caseId: number): Observable<FeeSummary> { return this.http.get<FeeSummary>(`${this.api}/cases/${caseId}/fees/summary`); }
  addFee(caseId: number, amount: number, paidOn: string, mode?: string, notes?: string): Observable<CasePayment> {
    return this.http.post<CasePayment>(`${this.api}/cases/${caseId}/fees`, { amount, paidOn, mode, notes });
  }
  deleteFee(caseId: number, paymentId: number): Observable<unknown> {
    return this.http.delete(`${this.api}/cases/${caseId}/fees/${paymentId}`);
  }
}
