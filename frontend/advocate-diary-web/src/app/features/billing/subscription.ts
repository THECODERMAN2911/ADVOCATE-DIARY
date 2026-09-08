import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../core/auth/auth.service';
import { BillingService, Plan, Subscription } from './billing.service';

@Component({
  selector: 'app-subscription',
  imports: [DatePipe, DecimalPipe, ButtonModule, CardModule, TagModule, MessageModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Subscription</h1>

    <p-card styleClass="mb-6 max-w-2xl">
      @if (sub(); as s) {
        @if (s.hasSubscription) {
          <div class="flex items-center justify-between">
            <div>
              <div class="text-lg font-medium">{{ s.planName }}</div>
              <div class="text-surface-500 text-sm">Valid until {{ s.endDate | date: 'dd MMM yyyy' }}</div>
            </div>
            <p-tag [value]="s.isActive ? (s.daysRemaining + ' days left') : 'Expired'"
                   [severity]="s.isActive ? 'success' : 'danger'" />
          </div>
        } @else {
          <p class="text-surface-500">No active subscription. Choose a plan below.</p>
        }
      }
    </p-card>

    @if (message()) { <p-message severity="success" [text]="message()!" styleClass="mb-4" /> }

    <h2 class="font-medium mb-3">Plans</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
      @for (p of plans(); track p.id) {
        <p-card [header]="p.name">
          <div class="text-2xl font-semibold mb-1">₹{{ p.price | number: '1.0-0' }}</div>
          <div class="text-surface-500 text-sm mb-3">{{ p.durationDays }} days · {{ p.description }}</div>
          @if (isAdmin) {
            <p-button label="Subscribe" [loading]="busyPlan() === p.id" (onClick)="subscribe(p)" styleClass="w-full" />
          }
        </p-card>
      } @empty {
        <p class="text-surface-500">No plans available.</p>
      }
    </div>
    @if (isAdmin) { <p class="text-surface-400 text-xs mt-3">Payment is simulated (stub gateway) until PayU/Stripe keys are configured.</p> }
  `,
})
export class SubscriptionPage implements OnInit {
  private svc = inject(BillingService);
  private auth = inject(AuthService);
  readonly isAdmin = this.auth.user()?.role === 'FirmAdmin';

  plans = signal<Plan[]>([]);
  sub = signal<Subscription | null>(null);
  busyPlan = signal<number | null>(null);
  message = signal<string | null>(null);

  ngOnInit() {
    this.svc.plans().subscribe((p) => this.plans.set(p));
    this.reloadSub();
  }

  reloadSub() { this.svc.subscription().subscribe((s) => this.sub.set(s)); }

  subscribe(p: Plan) {
    this.busyPlan.set(p.id);
    this.message.set(null);
    // Stub flow: checkout then immediately confirm (a real gateway would redirect + webhook-confirm).
    this.svc.checkout(p.id).subscribe({
      next: (co) => this.svc.confirm(co.paymentId).subscribe({
        next: (s) => { this.sub.set(s); this.busyPlan.set(null); this.message.set(`Subscribed to ${p.name}.`); },
        error: () => this.busyPlan.set(null),
      }),
      error: () => this.busyPlan.set(null),
    });
  }
}
