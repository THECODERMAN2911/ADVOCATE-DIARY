import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { CaseListItem } from '../cases/cases.service';

/**
 * Compact, clickable list of hearings/cases. Reused by Today / Previous / Calendar.
 *
 * By default it just renders `items` as given (fine for Today/Calendar, which are
 * bounded to a single day). Pass `lazy` + `totalRecords` when the backing list can
 * grow without bound (e.g. Previous) so paging happens on the server instead of
 * dumping every row into the DOM at once.
 */
@Component({
  selector: 'app-hearing-list',
  imports: [DatePipe, TableModule],
  template: `
    <p-table
      [value]="items"
      [loading]="loading"
      styleClass="p-datatable-sm"
      [tableStyle]="{ 'min-width': '36rem' }"
      [paginator]="lazy"
      [rows]="pageSize"
      [totalRecords]="totalRecords"
      [lazy]="lazy"
      (onLazyLoad)="onLazyLoad.emit($event)"
    >
      <ng-template pTemplate="header">
        <tr><th>Case No</th><th>Title</th><th>Party</th><th>Next Date</th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-c>
        <tr class="cursor-pointer" (click)="router.navigate(['/cases', c.id])">
          <td class="font-medium">{{ c.caseNumber }}</td>
          <td>{{ c.title }}</td>
          <td>{{ c.partyName }}</td>
          <td>{{ c.nextDate ? (c.nextDate | date: 'dd MMM yyyy') : '—' }}</td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="4" class="text-center text-surface-500 py-6">{{ emptyText }}</td></tr>
      </ng-template>
    </p-table>
  `,
})
export class HearingList {
  @Input() items: CaseListItem[] = [];
  @Input() loading = false;
  @Input() emptyText = 'Nothing here.';

  /** Set true for lists with no natural bound (e.g. Previous) to enable server-side paging. */
  @Input() lazy = false;
  @Input() pageSize = 20;
  @Input() totalRecords = 0;
  @Output() onLazyLoad = new EventEmitter<TableLazyLoadEvent>();

  readonly router = inject(Router);
}
