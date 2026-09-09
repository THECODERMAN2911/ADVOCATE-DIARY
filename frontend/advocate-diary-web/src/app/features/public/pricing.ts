import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PublicChrome } from './public-chrome';
import { BillingService, Plan } from '../billing/billing.service';

@Component({
  selector: 'app-public-pricing',
  imports: [DecimalPipe, RouterLink, ButtonModule, PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-5xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold text-center mb-2">Simple pricing</h1>
        <p class="text-surface-500 text-center mb-10">Start free, upgrade when you're ready.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          @for (p of plans(); track p.id; let i = $index) {
            <div class="public-plan-card rounded-xl p-6 text-center" [class.public-plan-featured]="i === 1">
              <h3 class="font-semibold text-lg">{{ p.name }}</h3>
              <div class="text-3xl font-bold my-3">₹{{ p.price | number: '1.0-0' }}</div>
              <div class="text-surface-500 text-sm mb-4">{{ p.durationDays }} days · {{ p.description }}</div>
              <a routerLink="/register"><p-button label="Get started" styleClass="w-full" /></a>
            </div>
          } @empty {
            <p class="text-surface-500 col-span-3 text-center">Pricing will be available shortly.</p>
          }
        </div>
      </section>
    </app-public-chrome>
  `,
})
export class PublicPricing implements OnInit {
  private svc = inject(BillingService);
  plans = signal<Plan[]>([]);
  ngOnInit() { this.svc.plans().subscribe((p) => this.plans.set(p)); }
}
