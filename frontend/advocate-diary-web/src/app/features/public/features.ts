import { Component } from '@angular/core';
import { PublicChrome } from './public-chrome';

@Component({
  selector: 'app-features',
  imports: [PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-5xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold mb-2">Features</h1>
        <p class="text-surface-500 mb-8">Everything an advocate's office needs, modernised.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          @for (f of items; track f.title) {
            <div class="flex gap-3">
              <i class="pi {{ f.icon }} text-primary text-xl mt-1"></i>
              <div><h3 class="font-semibold">{{ f.title }}</h3><p class="text-surface-500 text-sm">{{ f.text }}</p></div>
            </div>
          }
        </div>
      </section>
    </app-public-chrome>
  `,
})
export class Features {
  readonly items = [
    { icon: 'pi-calendar-clock', title: 'Daily cause list', text: "See every hearing scheduled for today at a glance." },
    { icon: 'pi-folder', title: 'Case management', text: 'Full case lifecycle with parties, stages and history.' },
    { icon: 'pi-bell', title: 'Reminders', text: 'Email/SMS/WhatsApp notifications when hearing dates change.' },
    { icon: 'pi-file', title: 'Documents', text: 'Upload, preview and download case documents securely.' },
    { icon: 'pi-indian-rupee', title: 'Fees tracking', text: 'Per-case fee ledger with agreed / received / balance.' },
    { icon: 'pi-users', title: 'Team & roles', text: 'Firm admin, lawyers and staff with role-based access.' },
    { icon: 'pi-chart-bar', title: 'Reports', text: 'Dashboard KPIs and one-click Excel export.' },
    { icon: 'pi-mobile', title: 'Mobile-ready', text: 'Responsive UI and a REST API for mobile apps.' },
  ];
}
