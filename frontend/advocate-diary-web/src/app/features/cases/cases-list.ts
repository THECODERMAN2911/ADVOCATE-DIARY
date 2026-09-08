import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  EMPTY,
  catchError,
  map,
  of,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import {
  CaseFilter,
  CaseListItem,
  CasesService,
  PagedResult
} from './cases.service';

@Component({
  selector: 'app-cases-list',
  imports: [
    FormsModule,
    DatePipe,
    TableModule,
    InputTextModule,
    ButtonModule,
    SelectButtonModule,
    TooltipModule
  ],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Cases</h1>

      <p-button
        label="New Case"
        icon="pi pi-plus"
        size="small"
        (onClick)="router.navigate(['/cases/new'])"
      />
    </div>

    <div class="mb-3 flex flex-wrap gap-2 items-center">

      <p-selectbutton
        [options]="filters"
        [(ngModel)]="filter"
        optionLabel="label"
        optionValue="value"
        (onChange)="reload()"
        [allowEmpty]="false"
      />

      <p-button
        label="Export to Excel"
        icon="pi pi-file-excel"
        severity="success"
        size="small"
        [loading]="exporting()"
        (onClick)="exportExcel()"
      />

      <span class="flex-1"></span>

      <input
        pInputText
        placeholder="Search case no, title, party…"
        [(ngModel)]="query"
        (ngModelChange)="onSearchChange($event)"
      />

      @if (query) {
        <p-button
          icon="pi pi-times"
          [text]="true"
          pTooltip="Clear search"
          (onClick)="clearSearch()"
        />
      }

      <p-button
        icon="pi pi-search"
        (onClick)="reload()"
        pTooltip="Search"
      />
    </div>

    <p-table
      [value]="rows()"
      [loading]="loading()"
      [paginator]="true"
      [rows]="pageSize"
      [first]="(page - 1) * pageSize"
      [totalRecords]="total()"
      [lazy]="true"
      (onLazyLoad)="onLazy($event)"
      styleClass="p-datatable-sm"
      [tableStyle]="{ 'min-width': '48rem' }"
    >

      <ng-template pTemplate="header">
        <tr>
          <th style="width:3rem"></th>
          <th>Case No</th>
          <th>Title</th>
          <th>Party</th>
          <th>Next Date</th>
          <th style="width:7rem"></th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-c>
        <tr
          class="cursor-pointer"
          (click)="open(c)"
        >
          <td (click)="$event.stopPropagation()">
            <i
              class="pi cursor-pointer"
              [class.pi-star-fill]="c.isStarred"
              [class.text-yellow-500]="c.isStarred"
              [class.pi-star]="!c.isStarred"
              (click)="toggleStar(c)"
            ></i>
          </td>

          <td class="font-medium">
            {{ c.caseNumber }}
          </td>

          <td>
            {{ c.title }}
          </td>

          <td>
            {{ c.partyName }}
          </td>

          <td>
            {{ c.nextDate ? (c.nextDate | date: 'dd MMM yyyy') : '—' }}
          </td>

          <td
            (click)="$event.stopPropagation()"
            class="text-right"
          >
            @if (c.isActive) {
              <p-button
                icon="pi pi-inbox"
                size="small"
                [text]="true"
                pTooltip="Archive"
                (onClick)="setArchived(c, true)"
              />
            } @else {
              <p-button
                icon="pi pi-replay"
                size="small"
                [text]="true"
                pTooltip="Restore"
                (onClick)="setArchived(c, false)"
              />
            }
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td
            colspan="6"
            class="text-center text-surface-500 py-6"
          >
            No cases found.
          </td>
        </tr>
      </ng-template>

    </p-table>
  `,
})
export class CasesList {
  private svc = inject(CasesService);

  readonly router = inject(Router);

  readonly filters = [
    { label: 'Active', value: 'Active' as CaseFilter },
    { label: 'Starred', value: 'Starred' as CaseFilter },
    { label: 'Archived', value: 'Archived' as CaseFilter },
  ];

  query = '';
  filter: CaseFilter = 'Active';

  pageSize = 20;

  rows = signal<CaseListItem[]>([]);
  total = signal(0);
  loading = signal(false);
  exporting = signal(false);

  page = 1;

  // Used for dynamic search
  private searchSubject = new Subject<string>();
  // Every list interaction shares this stream. switchMap below cancels the
  // browser request that is no longer relevant (for example, Active followed
  // immediately by Archived), instead of allowing old requests to queue.
  private loadSubject = new Subject<void>();
  private readonly pageCache = new Map<string, PagedResult<CaseListItem>>();

  constructor() {
    this.searchSubject
      .pipe(
        // Wait until the user stops typing
        debounceTime(400),

        // Ignore duplicate searches
        distinctUntilChanged(),

        // Cancel the previous search when a new one starts
        tap(() => this.page = 1)
      )
      .subscribe(() => this.load());

    this.loadSubject
      .pipe(
        map(() => ({
          page: this.page,
          pageSize: this.pageSize,
          query: this.query,
          filter: this.filter
        })),
        switchMap((request) => {
          const cacheKey = this.cacheKey(request);
          const cached = this.pageCache.get(cacheKey);

          this.loading.set(true);
          if (cached) return of(cached);

          return this.svc
            .list(request.page, request.pageSize, request.query, request.filter)
            .pipe(
              tap(result => this.pageCache.set(cacheKey, result)),
              catchError((err) => {
                // Only the current request can reach this handler: switchMap
                // unsubscribes (and aborts) requests superseded by a newer one.
                console.error('Failed to load cases:', err);
                this.loading.set(false);
                return EMPTY;
              })
            );
        })
      )
      .subscribe((r) => {
        this.rows.set(r.items);
        this.total.set(r.totalCount);
        this.loading.set(false);
      });
  }

  /**
   * Called whenever the user types in the search box.
   *
   * Search starts only after 2 characters.
   */
  onSearchChange(value: string) {
    this.query = value.trimStart();

    const searchText = this.query.trim();

    // Empty search:
    // load all cases.
    if (searchText.length === 0) {
      this.page = 1;
      this.searchSubject.next('');
      return;
    }

    // Do not search for only one character.
    if (searchText.length < 2) {
      return;
    }

    // Search after the debounce period.
    this.searchSubject.next(searchText);
  }

  /**
   * Clear the search box and reload all cases.
   */
  clearSearch() {
    this.query = '';
    this.page = 1;

    this.searchSubject.next('');
  }

  onLazy(e: TableLazyLoadEvent) {
    this.pageSize = e.rows ?? this.pageSize;

    this.page =
      Math.floor((e.first ?? 0) / this.pageSize) + 1;

    this.load();
  }

  reload() {
    this.page = 1;
    this.load();
  }

  exportExcel() {
    this.exporting.set(true);
    const searchText = this.query.trim();
    this.svc.exportCases(this.filter, searchText).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cases-${this.filter.toLowerCase()}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: (err) => {
        console.error('Failed to export cases:', err);
        this.exporting.set(false);
      },
    });
  }

  load() {
    this.loadSubject.next();
  }

  open(c: CaseListItem) {
    this.router.navigate(['/cases', c.id]);
  }

  toggleStar(c: CaseListItem) {
    this.svc
      .star(c.id, !c.isStarred)
      .subscribe({
        next: () => {
          this.pageCache.clear();
          this.load();
        },
        error: (err) =>
          console.error(
            'Failed to update star:',
            err
          )
      });
  }

  setArchived(c: CaseListItem, value: boolean) {
    this.svc
      .archive(c.id, value)
      .subscribe({
        next: () => {
          this.pageCache.clear();
          this.load();
        },
        error: (err) =>
          console.error(
            'Failed to update archive status:',
            err
          )
      });
  }

  private cacheKey(request: {
    page: number;
    pageSize: number;
    query: string;
    filter: CaseFilter;
  }) {
    return `${request.filter}|${request.page}|${request.pageSize}|${request.query}`;
  }
}
