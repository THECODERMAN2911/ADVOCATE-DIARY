import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-100 p-4">
      <div class="w-full max-w-sm bg-surface-0 rounded-2xl shadow-lg p-8">
        <div class="text-center mb-6">
          <i class="pi pi-book text-4xl text-primary"></i>
          <h1 class="text-2xl font-semibold mt-2">Advocate Diary</h1>
          <p class="text-surface-500 text-sm">Sign in to your account</p>
        </div>

        @if (error()) { <p-message severity="error" [text]="error()!" styleClass="w-full mb-3" /> }

        <form (ngSubmit)="submit()" class="flex flex-col gap-4">
          <input pInputText type="email" name="email" placeholder="Email"
                 [(ngModel)]="email" required class="w-full" />
          <p-password name="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true"
                      placeholder="Password" styleClass="w-full" inputStyleClass="w-full" required />
          <p-button type="submit" label="Sign in" [loading]="loading()" styleClass="w-full" />
        </form>

        <div class="flex justify-between text-sm mt-4">
          <a routerLink="/forgot-password" class="text-surface-500 hover:text-primary">Forgot password?</a>
          <a routerLink="/register" class="text-primary">Create account</a>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(e?.error?.message ?? 'Login failed'); this.loading.set(false); },
    });
  }
}
