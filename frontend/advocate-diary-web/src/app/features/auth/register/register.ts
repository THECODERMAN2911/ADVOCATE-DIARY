import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  template: `
    <div class="auth-shell min-h-screen flex items-center justify-center p-4">
      <div class="auth-card w-full max-w-md rounded-2xl p-8">
        <div class="text-center mb-6">
          <img src="company-logo.png" alt="Advocate Diary" class="auth-brand-mark" />
          <h1 class="text-2xl font-semibold mt-2">Create your firm account</h1>
        </div>

        @if (error()) { <p-message severity="error" [text]="error()!" styleClass="w-full mb-3" /> }

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <input pInputText name="firmName" placeholder="Firm / practice name" [(ngModel)]="model.firmName" required class="w-full" />
          <input pInputText name="fullName" placeholder="Your full name" [(ngModel)]="model.fullName" required class="w-full" />
          <input pInputText type="email" name="email" placeholder="Email" [(ngModel)]="model.email" required class="w-full" />
          <input pInputText name="phone" placeholder="Phone (optional)" [(ngModel)]="model.phone" class="w-full" />
          <p-password name="password" [(ngModel)]="model.password" [toggleMask]="true" placeholder="Password"
                      styleClass="w-full" inputStyleClass="w-full" required />
          <p-button type="submit" label="Create account" [loading]="loading()" styleClass="w-full" />
        </form>

        <p class="text-center text-sm text-surface-500 mt-4">
          Already have an account? <a routerLink="/login" class="text-primary">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { firmName: '', fullName: '', email: '', phone: '', password: '' };
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.register(this.model).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(e?.error?.message ?? 'Registration failed'); this.loading.set(false); },
    });
  }
}
