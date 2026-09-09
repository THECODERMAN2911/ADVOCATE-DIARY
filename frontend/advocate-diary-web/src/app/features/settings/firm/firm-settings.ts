import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { forkJoin } from 'rxjs';
import { IdentityService } from '../../../core/services/identity.service';

@Component({
  selector: 'app-firm-settings',
  imports: [FormsModule, ButtonModule, InputTextModule, MessageModule, CardModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">Firm Settings</h1>

    <p-card styleClass="max-w-2xl">
      @if (saved()) {
        <p-message
          severity="success"
          text="Firm details saved."
          styleClass="w-full mb-3"
        />
      }

      <form
        (ngSubmit)="save()"
        class="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-sm text-surface-600">Firm name</label>

          <input
            pInputText
            name="name"
            [(ngModel)]="m().name"
            class="w-full"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-surface-600">Phone</label>

          <input
            pInputText
            name="phone"
            [(ngModel)]="m().phone"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-surface-600">Email</label>

          <input
            pInputText
            name="email"
            [(ngModel)]="m().email"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm text-surface-600">City</label>

          <input
            pInputText
            name="city"
            [(ngModel)]="m().city"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-sm text-surface-600">Address</label>

          <input
            pInputText
            name="address"
            [(ngModel)]="m().address"
            class="w-full"
          />
        </div>

        <div class="sm:col-span-2">
          <p-button
            type="submit"
            label="Save"
            [loading]="saving()"
          />
        </div>
      </form>
    </p-card>
  `,
})
export class FirmSettings implements OnInit {
  private svc = inject(IdentityService);

  m = signal({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });

  saving = signal(false);
  saved = signal(false);

  ngOnInit() {
    forkJoin({ firm: this.svc.getFirm(), user: this.svc.getMe() }).subscribe({
      next: ({ firm: f, user }) => {
        this.m.set({
          name: f.name ?? '',
          address: f.address ?? '',
          city: f.city ?? '',
          phone: f.phone ?? user.phone ?? '',
          email: f.email?.trim() || user.email || ''
        });
      },
      error: (err) => {
        console.error('Failed to load firm details:', err);
      }
    });
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);

    this.svc.updateFirm(this.m()).subscribe({
      next: () => {
        this.saved.set(true);
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Failed to save firm details:', err);
        this.saving.set(false);
      },
    });
  }
}
