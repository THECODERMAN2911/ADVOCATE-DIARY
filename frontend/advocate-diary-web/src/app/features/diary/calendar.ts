import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DiaryService } from './diary.service';
import { HearingList } from './hearing-list';
import { CaseListItem } from '../cases/cases.service';

@Component({
  selector: 'app-calendar',
  imports: [FormsModule, DatePipe, DatePickerModule, CardModule, HearingList],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Calendar</h1>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <p-card>
        <p-datepicker [inline]="true" [(ngModel)]="selected" (onSelect)="load()" styleClass="w-full" />
      </p-card>
      <div class="lg:col-span-2">
        <h2 class="font-medium mb-2">Hearings on {{ selected | date: 'dd MMM yyyy' }}</h2>
        <app-hearing-list [items]="items()" [loading]="loading()" emptyText="No hearings on this date." />
      </div>
    </div>
  `,
})
export class CalendarView implements OnInit {
  private svc = inject(DiaryService);
  selected = new Date();
  items = signal<CaseListItem[]>([]);
  loading = signal(false);

  ngOnInit() { this.load(); }

  load() {
    const d = this.selected;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.loading.set(true);
    this.svc.causeList(iso).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
