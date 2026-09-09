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
      <p-card styleClass="calendar-card">
        <p-datepicker
          [inline]="true"
          [(ngModel)]="selected"
          (onSelect)="load()"
          (onMonthChange)="onMonthChange($event)"
          styleClass="w-full calendar-picker"
        >
          <ng-template #date let-date>
            <span class="calendar-day" [class.calendar-day-has-case]="hasCaseDate(date)">
              {{ date.day }}
              @if (hasCaseDate(date)) {
                <span class="calendar-case-dot"></span>
              }
            </span>
          </ng-template>
        </p-datepicker>
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
  caseDates = signal<Set<string>>(new Set());
  loading = signal(false);

  ngOnInit() {
    this.load();
    this.loadMonth(this.selected);
  }

  load() {
    const d = this.selected;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.loading.set(true);
    this.svc.causeList(iso).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onMonthChange(event: { month?: number; year?: number }) {
    if (event.month === undefined || event.year === undefined) return;
    this.loadMonth(new Date(event.year, event.month - 1, 1));
  }

  hasCaseDate(date: { day: number; month: number; year: number }) {
    return this.caseDates().has(this.dateKey(date.year, date.month + 1, date.day));
  }

  private loadMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const from = this.formatDate(new Date(year, month, 1));
    const to = this.formatDate(new Date(year, month + 1, 0));

    this.svc.calendar(from, to).subscribe({
      next: (cases) => this.caseDates.set(new Set(
        cases.filter((c) => c.nextDate).map((c) => c.nextDate!.slice(0, 10)),
      )),
      error: () => this.caseDates.set(new Set()),
    });
  }

  private formatDate(date: Date) {
    return this.dateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  private dateKey(year: number, month: number, day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
