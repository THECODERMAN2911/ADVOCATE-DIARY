import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PublicChrome } from './public-chrome';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ButtonModule, PublicChrome],
  template: `
    <app-public-chrome>
      <section class="landing-hero max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p class="text-primary text-xs font-semibold uppercase tracking-widest mb-4">Case management for advocates</p>
          <h1 class="text-5xl sm:text-6xl font-bold tracking-tight">Advocate Diary</h1>
          <p class="text-surface-500 text-lg mt-5 max-w-xl leading-8">
            Your practice, organised. Keep cases, hearing dates, clients, documents and fees in one calm workspace —
            with reminders that help you stay ahead.
          </p>
          <div class="flex flex-wrap gap-3 mt-8">
            <a routerLink="/register"><p-button label="Start free" icon="pi pi-arrow-right" iconPos="right" /></a>
            <a routerLink="/features"><p-button label="Explore features" severity="secondary" [outlined]="true" /></a>
          </div>
        </div>
        <div class="landing-preview">
          <div class="flex items-center justify-between mb-5"><span class="font-semibold">Today at a glance</span><span class="text-xs text-primary">Live workspace</span></div>
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div><span class="landing-preview-number">12</span><span class="landing-preview-label">Hearings today</span></div>
            <div><span class="landing-preview-number">48</span><span class="landing-preview-label">Active cases</span></div>
          </div>
          <div class="landing-preview-list">
            <div><i class="pi pi-calendar text-primary"></i><span>Cause list ready for review</span><i class="pi pi-check text-primary"></i></div>
            <div><i class="pi pi-bell text-coral"></i><span>3 follow-ups need attention</span><i class="pi pi-arrow-up-right text-surface-400"></i></div>
            <div><i class="pi pi-chart-line text-primary"></i><span>Fees and reports in one view</span><i class="pi pi-arrow-up-right text-surface-400"></i></div>
          </div>
        </div>
      </section>

      <section class="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-5">
        @for (f of highlights; track f.title) {
          <div class="public-feature-card rounded-xl p-6">
            <i class="pi {{ f.icon }} text-2xl text-primary"></i>
            <h3 class="font-semibold mt-3">{{ f.title }}</h3>
            <p class="text-surface-500 text-sm mt-1">{{ f.text }}</p>
          </div>
        }
      </section>
    </app-public-chrome>
  `,
})
export class Landing {
  readonly highlights = [
    { icon: 'pi-calendar', title: 'Never miss a hearing', text: 'Daily cause list, calendar and automatic party reminders.' },
    { icon: 'pi-folder', title: 'Every case in one place', text: 'Parties, documents, history and fees per case.' },
    { icon: 'pi-chart-bar', title: 'Know where you stand', text: 'Dashboard KPIs and Excel reports on cases and fees.' },
  ];
}
