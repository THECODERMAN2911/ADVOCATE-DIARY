import { Component } from '@angular/core';
import { PublicChrome } from './public-chrome';
import { faqItems } from '../help/faq-data';

@Component({
  selector: 'app-faq',
  imports: [PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-3xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold mb-2">FAQ / Troubleshooting</h1>
        <p class="text-surface-500 mb-8">Find quick answers to common questions about Advocate Diary.</p>
        <div class="flex flex-col gap-3">
          @for (item of faqs; track item.question) {
            <details class="rounded-lg border border-surface-200 px-5 py-4">
              <summary class="cursor-pointer font-semibold">{{ item.question }}</summary>
              <p class="text-surface-500 text-sm leading-6 mt-3">{{ item.answer }}</p>
            </details>
          }
        </div>
      </section>
    </app-public-chrome>
  `,
})
export class Faq {
  readonly faqs = faqItems;
}
