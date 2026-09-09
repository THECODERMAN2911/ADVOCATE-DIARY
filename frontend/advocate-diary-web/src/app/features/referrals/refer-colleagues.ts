import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-refer-colleagues',
  imports: [FormsModule, ButtonModule, CardModule, InputTextModule, MessageModule, TooltipModule],
  template: `
    <section class="max-w-4xl mx-auto">
      <div class="mb-6">
        <p class="text-primary text-sm font-semibold uppercase tracking-wide">Grow with Advocate Diary</p>
        <h1 class="text-3xl font-bold mt-1">Refer Colleagues</h1>
        <p class="text-surface-500 mt-2 max-w-2xl">
          You can get extra 15 days access by inviting your friends to try out Advocate-Diary.
          If a friend uses your invitation to sign up for an account, both of you will receive bonus 15 days additional access.
        </p>
      </div>

      <div class="max-w-3xl flex flex-col gap-5">
        <p-card header="Invite by email">
          <p class="text-surface-500 text-sm mb-4">Send your personal invitation to a fellow advocate.</p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input pInputText type="email" [(ngModel)]="email" placeholder="Enter email" class="w-full h-10" />
            <p-button label="Send invite" icon="pi pi-send" size="small" styleClass="h-10 whitespace-nowrap" (onClick)="sendInvite()" />
          </div>
          @if (inviteMessage) {
            <p-message severity="success" [text]="inviteMessage" styleClass="mt-4" />
          }
        </p-card>

        <p-card header="More ways to invite your friends">
          <p class="font-medium mb-2">+ Copy &amp; Paste Your Personal Invitation Link</p>
          <p class="text-surface-500 text-sm mb-3">Share this unique link for your firm:</p>
          <div class="flex items-center gap-2 mb-4">
            <input pInputText [value]="invitationLink" readonly class="w-full text-sm" />
            <p-button icon="pi pi-copy" [text]="true" severity="secondary" size="small" pTooltip="Copy invitation link" (onClick)="copyLink()" />
          </div>
          @if (copyNotice()) {
            <p-message severity="success" text="Invitation link copied." />
          }
        </p-card>

        <div class="flex flex-wrap justify-center gap-2">
          <a [href]="facebookShareUrl" target="_blank" rel="noopener noreferrer">
            <p-button label="Share on Facebook" icon="pi pi-facebook" severity="secondary" [outlined]="true" />
          </a>
          <a [href]="xShareUrl" target="_blank" rel="noopener noreferrer">
            <p-button label="Tweet on X" icon="pi pi-twitter" severity="secondary" [outlined]="true" />
          </a>
        </div>
      </div>
    </section>
  `,
})
export class ReferColleagues {
  private readonly auth = inject(AuthService);
  readonly invitationLink = `https://advocate-diary.com/register?ref=firm-${this.auth.user()?.firmId ?? 'invite'}`;
  readonly facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.invitationLink)}`;
  readonly xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.invitationLink)}&text=${encodeURIComponent('Try Advocate-Diary with me and get organised.')}`;
  email = '';
  inviteMessage = '';
  copyNotice = signal(false);

  sendInvite() {
    this.inviteMessage = this.email.trim() ? `Invitation prepared for ${this.email.trim()}.` : 'Enter an email address to prepare an invitation.';
  }

  copyLink() {
    navigator.clipboard.writeText(this.invitationLink);
    this.copyNotice.set(true);
    setTimeout(() => this.copyNotice.set(false), 3000);
  }
}