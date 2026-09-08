import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DiaryService } from './diary.service';
import { HearingList } from './hearing-list';
import { CaseListItem } from '../cases/cases.service';

@Component({
  selector: 'app-diary-previous',
  imports: [FormsModule, InputTextModule, ButtonModule, TooltipModule, HearingList],
  template: `
    <h1 class="text-2xl font-semibold mb-1">Previous Hearings</h1>
    <p class="text-surface-500 text-sm mb-4">Active cases whose next hearing date has already passed — update these.</p>
    <div class="mt-3 mb-3 flex flex-wrap gap-2 items-center">
      <p-button
        label="Export to Excel"
        icon="pi pi-file-excel"
        severity="success"
        size="small"
        [loading]="exporting()"
        (onClick)="exportExcel()"
      />
      <span class="flex-1"></span>
      <input
        pInputText
        placeholder="Search case no, title, party…"
        [(ngModel)]="query"
        (ngModelChange)="onSearchChange($event)"
      />
      @if (query) {
        <p-button
          icon="pi pi-times"
          [text]="true"
          pTooltip="Clear search"
          (onClick)="clearSearch()"
        />
      }
      <p-button
        icon="pi pi-search"
        (onClick)="searchNow()"
        pTooltip="Search"
      />
    </div>
    <app-hearing-list
      [items]="items()"
      [loading]="loading()"
      [lazy]="true"
      [pageSize]="pageSize"
      [totalRecords]="total()"
      (onLazyLoad)="onLazy($event)"
      emptyText="No overdue hearings. You're up to date."
    />
  `,
})
export class DiaryPrevious {
  private svc = inject(DiaryService);
  private destroyRef = inject(DestroyRef);
  private searchChanges = new Subject<string>();
  items = signal<CaseListItem[]>([]);
  total = signal(0);
  loading = signal(false);
  exporting = signal(false);
  query = '';

  pageSize = 20;
  private page = 1;

  constructor() {
    this.searchChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.page = 1;
      this.load();
    });
  }

  onLazy(e: TableLazyLoadEvent) {
    this.pageSize = e.rows ?? this.pageSize;
    this.page = Math.floor((e.first ?? 0) / this.pageSize) + 1;
    this.load();
  }

  onSearchChange(value: string) {
    this.query = value;
    this.searchChanges.next(value);
  }

  clearSearch() {
    this.onSearchChange('');
  }

  searchNow() {
    this.page = 1;
    this.load();
  }

  exportExcel() {
    this.exporting.set(true);
    this.svc.exportPrevious(this.query.trim()).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'previous-hearings.xlsx';
        link.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: (err) => {
        console.error('Failed to export previous hearings:', err);
        this.exporting.set(false);
      },
    });
  }

  private load() {
    this.loading.set(true);
    this.svc.previous(this.page, this.pageSize, this.query).subscribe({
      next: (r) => { this.items.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
