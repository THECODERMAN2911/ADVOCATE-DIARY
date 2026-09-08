import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardSummary } from './dashboard.service';

interface Kpi { label: string; value: string; icon: string; link?: string; accent: string; }

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      @for (k of kpis(); track k.label) {
        <a [routerLink]="k.link" class="bg-surface-0 rounded-xl border border-surface-200 p-5 flex items-center gap-4 hover:border-primary transition">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center {{ k.accent }}">
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
        <div class="rounded-xl bg-surface-100 p-5 text-center"><div class="text-surface-500 text-sm">Fees agreed</div><div class="text-xl font-semibold">₹{{ sum.feeAgreedTotal | number:'1.0-0' }}</div></div>
        <div class="rounded-xl bg-green-50 p-5 text-center"><div class="text-surface-500 text-sm">Fees received</div><div class="text-xl font-semibold text-green-600">₹{{ sum.feeReceivedTotal | number:'1.0-0' }}</div></div>
        <div class="rounded-xl bg-red-50 p-5 text-center"><div class="text-surface-500 text-sm">Outstanding</div><div class="text-xl font-semibold text-red-600">₹{{ sum.feeBalanceTotal | number:'1.0-0' }}</div></div>
      </div>
    }
  `,
})
export class Dashboard implements OnInit {
  private svc = inject(DashboardService);
  s = signal<DashboardSummary | null>(null);

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
  }
}
