import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { PublicChrome } from './public-chrome';
import { PublicService } from './public.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, ButtonModule, InputTextModule, TextareaModule, MessageModule, PublicChrome],
  template: `
    <app-public-chrome>
      <section class="max-w-xl mx-auto px-6 py-16">
        <h1 class="text-3xl font-bold mb-2">Contact us</h1>
        <p class="text-surface-500 mb-6">Questions about Advocate Diary? Send us a message.</p>

        @if (sent()) {
          <p-message severity="success" text="Thanks — we'll get back to you shortly." styleClass="w-full mb-3" />
        }

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <input pInputText name="name" placeholder="Your name" [(ngModel)]="m.name" required class="w-full" />
          <input pInputText type="email" name="email" placeholder="Email" [(ngModel)]="m.email" required class="w-full" />
          <input pInputText name="phone" placeholder="Phone (optional)" [(ngModel)]="m.phone" class="w-full" />
          <input pInputText name="subject" placeholder="Subject" [(ngModel)]="m.subject" class="w-full" />
          <textarea pTextarea name="message" rows="5" placeholder="Message" [(ngModel)]="m.message" required class="w-full"></textarea>
          <p-button type="submit" label="Send message" [loading]="sending()" />
        </form>
      </section>
    </app-public-chrome>
  `,
})
export class Contact {
  private svc = inject(PublicService);
  m = { name: '', email: '', phone: '', subject: '', message: '' };
  sending = signal(false);
  sent = signal(false);

  submit() {
    this.sending.set(true);
    this.svc.contact(this.m).subscribe({
      next: () => { this.sent.set(true); this.sending.set(false); this.m = { name: '', email: '', phone: '', subject: '', message: '' }; },
      error: () => this.sending.set(false),
    });
  }
}
