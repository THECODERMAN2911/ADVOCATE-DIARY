import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DiaryService, NotificationLog } from '../diary/diary.service';

@Component({
  selector: 'app-notifications-log',
  imports: [DatePipe, TableModule, TagModule],
  template: `
    <h1 class="text-2xl font-semibold mb-1">Notifications</h1>
    <p class="text-surface-500 text-sm mb-4">Delivery log for party notifications (email now; SMS/WhatsApp coming). Per-case opt-in flags control what gets sent.</p>

    <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
      <ng-template pTemplate="header">
        <tr><th>When</th><th>Channel</th><th>Status</th><th>Recipient</th><th>Subject</th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-n>
        <tr>
          <td>{{ n.createdAt | date: 'dd MMM yyyy, HH:mm' }}</td>
          <td>{{ n.channel }}</td>
          <td><p-tag [value]="n.status" [severity]="severity(n.status)" /></td>
          <td>{{ n.recipient }}</td>
          <td>
            {{ n.subject }}
            @if (n.error) { <div class="text-red-500 text-xs">{{ n.error }}</div> }
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="5" class="text-center text-surface-500 py-6">No notifications sent yet.</td></tr>
      </ng-template>
    </p-table>
  `,
})
export class NotificationsLog implements OnInit {
  private svc = inject(DiaryService);
  rows = signal<NotificationLog[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.svc.notificationLog().subscribe({
      next: (r) => { this.rows.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  severity(status: string): 'success' | 'danger' | 'warn' {
    return status === 'Sent' ? 'success' : status === 'Failed' ? 'danger' : 'warn';
  }
}
