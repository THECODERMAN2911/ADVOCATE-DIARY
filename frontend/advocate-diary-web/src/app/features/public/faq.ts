import { Component } from '@angular/core';
import { PublicChrome } from './public-chrome';

@Component({
  selector: 'app-faq',
  imports: [PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-3xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold mb-8">Frequently asked questions</h1>
        <div class="flex flex-col gap-6">
          @for (q of faqs; track q.q) {
            <div>
              <h3 class="font-semibold">{{ q.q }}</h3>
              <p class="text-surface-500 text-sm mt-1">{{ q.a }}</p>
            </div>
          }
        </div>
      </section>
    </app-public-chrome>
  `,
})
export class Faq {
  readonly faqs = [
    { q: 'Is my data secure?', a: 'Yes — each firm\'s data is isolated, access is role-based, and documents are stored securely.' },
    { q: 'Can I access it on my phone?', a: 'The web app is fully responsive and a mobile API is available.' },
    { q: 'How do reminders work?', a: 'When a hearing date changes, the party can be notified by email (SMS/WhatsApp coming) based on per-case settings.' },
    { q: 'Can I export my data?', a: 'Yes — cases and fees can be exported to Excel from the Reports screen.' },
    { q: 'How do I get started?', a: 'Register your firm, add your masters (courts/types/stages), then start adding cases.' },
  ];
}
