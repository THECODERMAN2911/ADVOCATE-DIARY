import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { IdentityService } from '../../../core/services/identity.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule, CardModule],
  template: `
    <h1 class="text-2xl font-semibold mb-4">My Profile</h1>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <p-card header="Personal details">
        @if (savedProfile()) { <p-message severity="success" text="Profile saved." styleClass="w-full mb-3" /> }
        <form (ngSubmit)="saveProfile()" class="flex flex-col gap-3">
          <label class="text-sm text-surface-600">Full name</label>
             <input pInputText name="fullName" [ngModel]="fullName()"
               (ngModelChange)="fullName.set($event)" class="w-full" required />
          <label class="text-sm text-surface-600">Phone</label>
             <input pInputText name="phone" [ngModel]="phone()"
               (ngModelChange)="phone.set($event)" class="w-full" />
          <p-button type="submit" label="Save" [loading]="savingProfile()" />
        </form>
      </p-card>

      <p-card header="Change password">
        @if (pwdError()) { <p-message severity="error" [text]="pwdError()!" styleClass="w-full mb-3" /> }
        @if (pwdSaved()) { <p-message severity="success" text="Password changed." styleClass="w-full mb-3" /> }
        <form (ngSubmit)="changePassword()" class="flex flex-col gap-3">
          <p-password name="current" [(ngModel)]="current" [feedback]="false" [toggleMask]="true"
                      placeholder="Current password" styleClass="w-full" inputStyleClass="w-full" required />
          <p-password name="next" [(ngModel)]="next" [toggleMask]="true"
                      placeholder="New password" styleClass="w-full" inputStyleClass="w-full" required />
          <p-button type="submit" label="Update password" [loading]="savingPwd()" />
        </form>
      </p-card>
    </div>
  `,
})
export class Profile implements OnInit {
  private svc = inject(IdentityService);

  fullName = signal('');
  phone = signal('');
  current = '';
  next = '';

  savingProfile = signal(false);
  savedProfile = signal(false);
  savingPwd = signal(false);
  pwdSaved = signal(false);
  pwdError = signal<string | null>(null);

  ngOnInit() {
    this.svc.getMe().subscribe((u) => {
      this.fullName.set(u.fullName);
      this.phone.set(u.phone ?? '');
    });
  }

  saveProfile() {
    this.savingProfile.set(true);
    this.savedProfile.set(false);
    this.svc.updateProfile({ fullName: this.fullName(), phone: this.phone() }).subscribe({
      next: () => { this.savedProfile.set(true); this.savingProfile.set(false); },
      error: () => this.savingProfile.set(false),
    });
  }

  changePassword() {
    this.savingPwd.set(true);
    this.pwdError.set(null);
    this.pwdSaved.set(false);
    this.svc.changePassword(this.current, this.next).subscribe({
      next: () => { this.pwdSaved.set(true); this.savingPwd.set(false); this.current = ''; this.next = ''; },
      error: (e) => { this.pwdError.set(e?.error?.message ?? 'Failed'); this.savingPwd.set(false); },
    });
  }
}
