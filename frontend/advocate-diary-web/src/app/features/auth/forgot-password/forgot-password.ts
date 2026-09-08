import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-100 p-4">
      <div class="w-full max-w-sm bg-surface-0 rounded-2xl shadow-lg p-8">
        <h1 class="text-xl font-semibold mb-2">Forgot password</h1>
        <p class="text-surface-500 text-sm mb-4">We'll email you a reset link if the account exists.</p>

        @if (sent()) {
          <p-message severity="success" text="Check your email for a reset link." styleClass="w-full mb-3" />
        }

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <input pInputText type="email" name="email" placeholder="Email" [(ngModel)]="email" required class="w-full" />
          <p-button type="submit" label="Send reset link" [loading]="loading()" styleClass="w-full" />
        </form>

        <p class="text-center text-sm text-surface-500 mt-4"><a routerLink="/login" class="text-primary">Back to sign in</a></p>
      </div>
    </div>
  `,
})
export class ForgotPassword {
  private auth = inject(AuthService);
  email = '';
  loading = signal(false);
  sent = signal(false);

  submit() {
    this.loading.set(true);
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.sent.set(true); this.loading.set(false); },
      error: () => { this.sent.set(true); this.loading.set(false); }, // do not reveal existence
    });
  }
}
