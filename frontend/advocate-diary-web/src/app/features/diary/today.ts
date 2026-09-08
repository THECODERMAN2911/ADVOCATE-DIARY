import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DiaryService } from './diary.service';
import { HearingList } from './hearing-list';
import { CaseListItem } from '../cases/cases.service';

@Component({
  selector: 'app-diary-today',
  imports: [DatePipe, HearingList],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Today's Case List</h1>
      <span class="text-surface-500">{{ today | date: 'EEEE, dd MMM yyyy' }}</span>
    </div>
    <app-hearing-list [items]="items()" [loading]="loading()" emptyText="No hearings scheduled for today." />
  `,
})
export class DiaryToday implements OnInit {
  private svc = inject(DiaryService);
  readonly today = new Date();
  items = signal<CaseListItem[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.svc.causeList().subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
