import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { CaseReportRow, DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-reports',
  imports: [FormsModule, DatePipe, DecimalPipe, TableModule, ButtonModule, ToggleSwitchModule, TagModule],
  template: `
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h1 class="text-2xl font-semibold">Reports</h1>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-surface-600">
          <p-toggleswitch [(ngModel)]="includeArchived" (onChange)="reload()" /> Include archived
        </label>
        <p-button label="Export to Excel" icon="pi pi-file-excel" size="small" [loading]="exporting()" (onClick)="exportExcel()" />
      </div>
    </div>

    <p-table [value]="rows()" [loading]="loading()" [paginator]="true" [rows]="pageSize" [totalRecords]="total()"
             [lazy]="true" (onLazyLoad)="onLazy($event)" styleClass="p-datatable-sm"
             [tableStyle]="{ 'min-width': '48rem' }">
      <ng-template pTemplate="header">
        <tr><th>Case No</th><th>Title</th><th>Party</th><th>Next Date</th><th class="text-right">Fee Agreed</th><th class="text-right">Balance</th><th>Status</th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-r>
        <tr>
          <td class="font-medium">{{ r.caseNumber }}</td>
          <td>{{ r.title }}</td>
          <td>{{ r.party }}</td>
          <td>{{ r.nextDate ? (r.nextDate | date: 'dd MMM yyyy') : '—' }}</td>
          <td class="text-right">₹{{ r.feeAgreed | number: '1.0-0' }}</td>
          <td class="text-right">₹{{ r.feeBalance | number: '1.0-0' }}</td>
          <td><p-tag [value]="r.isActive ? 'Active' : 'Archived'" [severity]="r.isActive ? 'success' : 'danger'" /></td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="7" class="text-center text-surface-500 py-6">No cases.</td></tr>
      </ng-template>
    </p-table>
  `,
})
export class Reports implements OnInit {
  private svc = inject(DashboardService);

  rows = signal<CaseReportRow[]>([]);
  total = signal(0);
  loading = signal(false);
  exporting = signal(false);
  includeArchived = false;
  pageSize = 25;
  private page = 1;

  ngOnInit() { }

  load() {
    this.loading.set(true);
    this.svc.casesReport(this.includeArchived, this.page, this.pageSize).subscribe({
      next: (r) => { this.rows.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  reload() {
    this.page = 1;
    this.load();
  }

  onLazy(event: TableLazyLoadEvent) {
    this.pageSize = event.rows ?? this.pageSize;
    this.page = Math.floor((event.first ?? 0) / this.pageSize) + 1;
    this.load();
  }

  exportExcel() {
    this.exporting.set(true);
    this.svc.exportCases(this.includeArchived).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cases-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false),
    });
  }
}
