import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { CaseReportRow, DashboardService } from '../dashboard/dashboard.service';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-reports',
  imports: [FormsModule, DatePipe, DecimalPipe, TableModule, ButtonModule, InputTextModule, TooltipModule, ToggleSwitchModule, TagModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Reports</h1>

    <div class="mb-3 flex flex-wrap gap-2 items-center">
      <label class="flex items-center gap-2 text-sm text-surface-600">
        <p-toggleswitch [(ngModel)]="includeArchived" (onChange)="reload()" /> Include archived
      </label>
      <p-button label="Export to Excel" icon="pi pi-file-excel" size="small" [loading]="exporting()" (onClick)="exportExcel()" />
      <span class="flex-1"></span>
      <input
        pInputText
        placeholder="Search case no, title, party…"
        [(ngModel)]="query"
        (ngModelChange)="onSearchChange($event)"
      />
      @if (query) {
        <p-button icon="pi pi-times" [text]="true" pTooltip="Clear search" (onClick)="clearSearch()" />
      }
      <p-button icon="pi pi-search" (onClick)="searchNow()" pTooltip="Search" />
    </div>

    <p-table [value]="rows()" [loading]="loading()" [paginator]="true" [rows]="pageSize" [first]="(page - 1) * pageSize" [totalRecords]="total()"
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
  private destroyRef = inject(DestroyRef);

  rows = signal<CaseReportRow[]>([]);
  total = signal(0);
  loading = signal(false);
  exporting = signal(false);
  query = '';
  includeArchived = false;
  pageSize = 25;
  page = 1;
  private searchChanges = new Subject<string>();
  private loadChanges = new Subject<void>();

  constructor() {
    this.searchChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.page = 1;
      this.loadChanges.next();
    });

    this.loadChanges.pipe(
      map(() => ({
        includeArchived: this.includeArchived,
        page: this.page,
        pageSize: this.pageSize,
        query: this.query.trim(),
      })),
      tap(() => this.loading.set(true)),
      switchMap((request) => this.svc.casesReport(
        request.includeArchived,
        request.page,
        request.pageSize,
        request.query,
      ).pipe(
        catchError(() => {
          this.loading.set(false);
          return EMPTY;
        }),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((r) => {
      this.rows.set(r.items);
      this.total.set(r.totalCount);
      this.loading.set(false);
    });
  }

  ngOnInit() { }

  load() {
    this.loadChanges.next();
  }

  reload() {
    this.page = 1;
    this.load();
  }

  onSearchChange(value: string) {
    this.query = value.trim();
    this.searchChanges.next(this.query.trim());
  }

  clearSearch() {
    this.onSearchChange('');
  }

  searchNow() {
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
    this.svc.exportCases(this.includeArchived, this.query.trim()).subscribe({
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
