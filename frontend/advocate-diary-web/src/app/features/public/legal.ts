import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PublicChrome } from './public-chrome';

@Component({
  selector: 'app-privacy',
  imports: [PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-3xl mx-auto px-6 py-16 prose">
        <h1 class="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p class="text-surface-600">We collect only the information needed to provide the service — your firm and
          user details, and the case data you enter. Data is stored securely, isolated per firm, and never sold.
          You can export or request deletion of your data at any time. Contact us for any privacy request.</p>
      </section>
    </app-public-chrome>
  `,
})
export class Privacy {}

@Component({
  selector: 'app-disclaimer',
  imports: [PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-3xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold mb-4">Disclaimer</h1>
        <p class="text-surface-600">Advocate Diary is a practice-management tool and does not provide legal advice.
          While we strive for accuracy of reminders and data, users are responsible for verifying hearing dates and
          case details with the relevant courts. The service is provided "as is" without warranties of any kind.</p>
      </section>
    </app-public-chrome>
  `,
})
export class Disclaimer {}

@Component({
  selector: 'app-thank-you',
  imports: [RouterLink, ButtonModule, PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-xl mx-auto px-6 py-24 text-center">
        <i class="pi pi-check-circle text-5xl text-green-500"></i>
        <h1 class="text-3xl font-bold mt-4">Thank you!</h1>
        <p class="text-surface-500 mt-2">We've received your request and will be in touch shortly.</p>
        <a routerLink="/home" class="inline-block mt-6"><p-button label="Back to home" /></a>
      </section>
    </app-public-chrome>
  `,
})
export class ThankYou {}
