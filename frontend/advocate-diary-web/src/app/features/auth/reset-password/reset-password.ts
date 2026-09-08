import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink, ButtonModule, PasswordModule, MessageModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-100 p-4">
      <div class="w-full max-w-sm bg-surface-0 rounded-2xl shadow-lg p-8">
        <h1 class="text-xl font-semibold mb-4">Set a new password</h1>

        @if (error()) { <p-message severity="error" [text]="error()!" styleClass="w-full mb-3" /> }
        @if (done()) {
          <p-message severity="success" text="Password updated. You can sign in now." styleClass="w-full mb-3" />
          <a routerLink="/login" class="text-primary text-sm">Go to sign in</a>
        } @else {
          <form (ngSubmit)="submit()" class="flex flex-col gap-3">
            <p-password name="password" [(ngModel)]="password" [toggleMask]="true" placeholder="New password"
                        styleClass="w-full" inputStyleClass="w-full" required />
            <p-button type="submit" label="Update password" [loading]="loading()" styleClass="w-full" />
          </form>
        }
      </div>
    </div>
  `,
})
export class ResetPassword {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';
  password = '';
  loading = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (!this.token) { this.error.set('Missing or invalid reset token.'); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => { this.done.set(true); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Reset failed'); this.loading.set(false); },
    });
  }
}
