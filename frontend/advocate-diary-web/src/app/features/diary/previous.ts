import { Component, inject, signal } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { DiaryService } from './diary.service';
import { HearingList } from './hearing-list';
import { CaseListItem } from '../cases/cases.service';

@Component({
  selector: 'app-diary-previous',
  imports: [HearingList],
  template: `
    <h1 class="text-2xl font-semibold mb-1">Previous Hearings</h1>
    <p class="text-surface-500 text-sm mb-4">Active cases whose next hearing date has already passed — update these.</p>
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
  items = signal<CaseListItem[]>([]);
  total = signal(0);
  loading = signal(false);

  pageSize = 20;
  private page = 1;

  onLazy(e: TableLazyLoadEvent) {
    this.pageSize = e.rows ?? this.pageSize;
    this.page = Math.floor((e.first ?? 0) / this.pageSize) + 1;
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.svc.previous(this.page, this.pageSize).subscribe({
      next: (r) => { this.items.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
