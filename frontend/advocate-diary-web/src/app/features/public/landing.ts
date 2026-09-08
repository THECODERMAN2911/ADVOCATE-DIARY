import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PublicChrome } from './public-chrome';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ButtonModule, PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">Your practice, organised.</h1>
        <p class="text-surface-500 text-lg mt-4 max-w-2xl mx-auto">
          Advocate Diary keeps your cases, hearing dates, clients, documents and fees in one place —
          with automatic reminders so you never miss a date.
        </p>
        <div class="flex gap-3 justify-center mt-8">
          <a routerLink="/register"><p-button label="Start free" icon="pi pi-arrow-right" iconPos="right" /></a>
          <a routerLink="/features"><p-button label="See features" severity="secondary" [outlined]="true" /></a>
        </div>
      </section>

      <section class="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
        @for (f of highlights; track f.title) {
          <div class="rounded-xl border border-surface-200 p-6">
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
