import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary } from './dashboard.service';
import { DiaryService } from '../diary/diary.service';
import { HearingList } from '../diary/hearing-list';
import { CaseListItem } from '../cases/cases.service';

interface Kpi { label: string; value: string; icon: string; link?: string; accent: string; }

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, RouterLink, HearingList],
  template: `
    <div class="dashboard-intro flex items-end justify-between mb-6">
      <div>
        <p class="text-primary text-xs font-semibold uppercase tracking-widest mb-2">Practice overview</p>
        <h1 class="text-3xl font-semibold">Your day at a glance</h1>
        <p class="text-surface-500 mt-1">Keep every hearing, case, and follow-up moving.</p>
      </div>
      <span class="dashboard-date">{{ today | date: 'EEEE, dd MMM yyyy' }}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      @for (k of kpis(); track k.label) {
        <a [routerLink]="k.link" class="dashboard-kpi rounded-xl p-5 flex items-center gap-4 transition">
          <div class="dashboard-kpi-icon w-12 h-12 rounded-lg flex items-center justify-center {{ k.accent }}">
            <i class="pi {{ k.icon }} text-xl"></i>
          </div>
          <div>
            <div class="text-2xl font-semibold">{{ k.value }}</div>
            <div class="text-surface-500 text-sm">{{ k.label }}</div>
          </div>
        </a>
      }
    </div>

    @if (s(); as sum) {
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        <div class="dashboard-fee dashboard-fee-neutral rounded-xl p-5 text-center"><div class="text-surface-500 text-sm">Fees agreed</div><div class="text-xl font-semibold mt-1">₹{{ sum.feeAgreedTotal | number:'1.0-0' }}</div></div>
        <div class="dashboard-fee dashboard-fee-positive rounded-xl p-5 text-center"><div class="text-surface-500 text-sm">Fees received</div><div class="text-xl font-semibold text-green-600 mt-1">₹{{ sum.feeReceivedTotal | number:'1.0-0' }}</div></div>
        <div class="dashboard-fee dashboard-fee-warning rounded-xl p-5 text-center"><div class="text-surface-500 text-sm">Outstanding</div><div class="text-xl font-semibold text-red-600 mt-1">₹{{ sum.feeBalanceTotal | number:'1.0-0' }}</div></div>
      </div>
    }

    <section class="dashboard-workspace mb-6 mt-7">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Today's Cases</h2>
        <a routerLink="/diary/today" class="text-primary text-sm font-medium">View all</a>
      </div>
      <app-hearing-list
        [items]="visibleTodayCases()"
        [loading]="todayCasesLoading()"
        emptyText="No cases scheduled for today."
      />
      @if (visibleTodayCases().length < todayCases().length) {
        <div class="flex justify-center mt-4">
          <button
            type="button"
            class="text-primary text-sm font-medium hover:underline"
            (click)="loadMoreTodayCases()"
          >
            Load more
          </button>
        </div>
      }
    </section>
  `,
})
export class Dashboard implements OnInit {
  private svc = inject(DashboardService);
  private diarySvc = inject(DiaryService);
  s = signal<DashboardSummary | null>(null);
  readonly today = new Date();
  todayCases = signal<CaseListItem[]>([]);
  visibleTodayCaseCount = signal(5);
  todayCasesLoading = signal(false);
  visibleTodayCases = computed(() => this.todayCases().slice(0, this.visibleTodayCaseCount()));

  readonly kpis = computed<Kpi[]>(() => {
    const d = this.s();
    return [
      { label: "Today's hearings", value: d ? `${d.todayHearings}` : '—', icon: 'pi-calendar', link: '/diary/today', accent: 'bg-primary-50 text-primary' },
      { label: 'Upcoming (7 days)', value: d ? `${d.upcoming7Days}` : '—', icon: 'pi-clock', link: '/calendar', accent: 'bg-blue-50 text-blue-600' },
      { label: 'Pending diary', value: d ? `${d.pendingDiary}` : '—', icon: 'pi-exclamation-circle', link: '/diary/previous', accent: 'bg-orange-50 text-orange-600' },
      { label: 'Active cases', value: d ? `${d.activeCases}` : '—', icon: 'pi-folder', link: '/cases', accent: 'bg-surface-100 text-surface-600' },
    ];
  });

  ngOnInit() {
    this.svc.summary().subscribe((r) => this.s.set(r));
    this.todayCasesLoading.set(true);
    this.diarySvc.causeList().subscribe({
      next: (r) => { this.todayCases.set(r); this.todayCasesLoading.set(false); },
      error: () => this.todayCasesLoading.set(false),
    });
  }

  loadMoreTodayCases() {
    this.visibleTodayCaseCount.update((count) => count + 5);
  }
}
