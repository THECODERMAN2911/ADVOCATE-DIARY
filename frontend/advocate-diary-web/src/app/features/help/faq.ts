import { Component } from '@angular/core';
import { faqItems } from './faq-data';

@Component({
  selector: 'app-help-faq',
  template: `
    <section class="max-w-4xl mx-auto">
      <div class="mb-6">
        <p class="text-primary text-sm font-semibold uppercase tracking-wide">Help centre</p>
        <h1 class="text-3xl font-bold mt-1">FAQ / Troubleshooting</h1>
        <p class="text-surface-500 mt-2">Find quick answers to common questions about Advocate Diary.</p>
      </div>

      <div class="flex flex-col gap-3">
        @for (item of faqs; track item.question) {
          <details class="rounded-lg border border-surface-200 bg-surface-0 px-5 py-4 shadow-sm">
            <summary class="cursor-pointer font-semibold text-surface-800">{{ item.question }}</summary>
            <p class="text-surface-600 text-sm leading-6 mt-3 pr-6">{{ item.answer }}</p>
          </details>
        }
      </div>
    </section>
  `,
})
export class HelpFaq {
  readonly faqs = faqItems;
}