import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { BillingService, CasePayment, FeeSummary } from './billing.service';

/** Fee-received ledger for a case: summary + payments + add. Embedded in the case view. */
@Component({
  selector: 'app-case-fees',
  imports: [FormsModule, DatePipe, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, TableModule],
  template: `
    @if (summary(); as s) {
      <div class="grid grid-cols-3 gap-3 mb-4 text-center">
        <div class="rounded-lg bg-surface-100 p-3"><div class="text-surface-500 text-xs">Agreed</div><div class="font-semibold">₹{{ s.feeAgreed | number: '1.0-0' }}</div></div>
        <div class="rounded-lg bg-green-50 p-3"><div class="text-surface-500 text-xs">Received</div><div class="font-semibold text-green-600">₹{{ s.totalReceived | number: '1.0-0' }}</div></div>
        <div class="rounded-lg bg-red-50 p-3"><div class="text-surface-500 text-xs">Balance</div><div class="font-semibold text-red-600">₹{{ s.balance | number: '1.0-0' }}</div></div>
      </div>
    }

    <div class="flex flex-wrap items-end gap-2 mb-3 border-b border-surface-200 pb-3">
      <div class="flex flex-col gap-1"><label class="text-xs text-surface-500">Amount</label>
        <p-inputnumber [(ngModel)]="amount" mode="currency" currency="INR" locale="en-IN" /></div>
      <div class="flex flex-col gap-1"><label class="text-xs text-surface-500">Date</label>
        <input type="date" pInputText [(ngModel)]="paidOn" /></div>
      <div class="flex flex-col gap-1"><label class="text-xs text-surface-500">Mode</label>
        <input pInputText [(ngModel)]="mode" placeholder="Cash / UPI…" /></div>
      <p-button label="Add payment" icon="pi pi-plus" size="small" [disabled]="!amount || !paidOn" [loading]="saving()" (onClick)="add()" />
    </div>

    <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr><th>Date</th><th>Amount</th><th>Mode</th><th>Notes</th><th></th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-p>
        <tr>
          <td>{{ p.paidOn | date: 'dd MMM yyyy' }}</td>
          <td>₹{{ p.amount | number: '1.0-0' }}</td>
          <td>{{ p.mode }}</td>
          <td>{{ p.notes }}</td>
          <td class="text-right"><p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="remove(p)" /></td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="5" class="text-center text-surface-500 py-4">No payments recorded.</td></tr>
      </ng-template>
    </p-table>
  `,
})
export class CaseFees implements OnInit {
  @Input({ required: true }) caseId!: number;
  private svc = inject(BillingService);

  rows = signal<CasePayment[]>([]);
  summary = signal<FeeSummary | null>(null);
  loading = signal(false);
  saving = signal(false);

  amount: number | null = null;
  paidOn = '';
  mode = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.fees(this.caseId).subscribe({
      next: (r) => { this.rows.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.svc.feeSummary(this.caseId).subscribe((s) => this.summary.set(s));
  }

  add() {
    if (!this.amount || !this.paidOn) return;
    this.saving.set(true);
    this.svc.addFee(this.caseId, this.amount, this.paidOn, this.mode).subscribe({
      next: () => { this.saving.set(false); this.amount = null; this.mode = ''; this.load(); },
      error: () => this.saving.set(false),
    });
  }

  remove(p: CasePayment) { this.svc.deleteFee(this.caseId, p.id).subscribe(() => this.load()); }
}
