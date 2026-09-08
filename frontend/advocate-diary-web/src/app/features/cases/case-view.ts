import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CaseDetail, CaseHistoryItem, CasesService } from './cases.service';
import { CaseDocuments } from './case-documents';
import { CaseFees } from '../billing/case-fees';

@Component({
  selector: 'app-case-view',
  imports: [FormsModule, DatePipe, ButtonModule, CardModule, InputTextModule, TextareaModule, TagModule, TooltipModule, CaseDocuments, CaseFees],
  template: `
    @if (item(); as c) {
      <div class="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold flex items-center gap-2">
            {{ c.caseNumber }}
            @if (c.isStarred) { <i class="pi pi-star-fill text-yellow-500"></i> }
            @if (!c.isActive) { <p-tag value="Archived" severity="danger" /> }
          </h1>
          <p class="text-surface-500">{{ c.title }}</p>
        </div>
        <div class="flex gap-2">
          <p-button [icon]="c.isStarred ? 'pi pi-star-fill' : 'pi pi-star'" severity="secondary" [text]="true"
                    (onClick)="toggleStar(c)" pTooltip="Star" />
          <p-button label="Edit" icon="pi pi-pencil" (onClick)="router.navigate(['/cases', c.id, 'edit'])" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl">
        <p-card header="Details" styleClass="lg:col-span-2">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-surface-500">Party</dt><dd>{{ c.partyName || '—' }}</dd></div>
            <div><dt class="text-surface-500">Defendant</dt><dd>{{ c.defendant || '—' }}</dd></div>
            <div><dt class="text-surface-500">Next hearing</dt><dd>{{ c.nextDate ? (c.nextDate | date:'dd MMM yyyy') : '—' }}</dd></div>
            <div><dt class="text-surface-500">Filing date</dt><dd>{{ c.filingDate ? (c.filingDate | date:'dd MMM yyyy') : '—' }}</dd></div>
            <div><dt class="text-surface-500">Phone</dt><dd>{{ c.partyPhone || '—' }}</dd></div>
            <div><dt class="text-surface-500">Email</dt><dd>{{ c.partyEmail || '—' }}</dd></div>
            <div><dt class="text-surface-500">Opposite lawyer</dt><dd>{{ c.oppositeLawyer || '—' }}</dd></div>
            <div><dt class="text-surface-500">Fee agreed / balance</dt><dd>{{ c.feeAgreed }} / {{ c.feeBalance }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-surface-500">Remarks</dt><dd>{{ c.remarks || '—' }}</dd></div>
          </dl>
        </p-card>

        <p-card header="Hearing history">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2 border-b border-surface-200 pb-3">
              <input type="date" pInputText [(ngModel)]="noteDate" class="w-full" />
              <textarea pTextarea [(ngModel)]="noteText" rows="2" placeholder="Add a note / next date…" class="w-full"></textarea>
              <p-button label="Add note" icon="pi pi-plus" size="small" [loading]="adding()" (onClick)="addNote(c.id)" [disabled]="!noteDate" />
            </div>
            @for (h of history(); track h.id) {
              <div class="text-sm">
                <div class="font-medium">{{ h.hearingDate | date:'dd MMM yyyy' }}</div>
                <div class="text-surface-600">{{ h.notes }}</div>
              </div>
            } @empty {
              <p class="text-surface-500 text-sm">No history yet.</p>
            }
          </div>
        </p-card>

        <p-card header="Documents" styleClass="lg:col-span-3">
          <app-case-documents [caseId]="c.id" />
        </p-card>

        <p-card header="Fees" styleClass="lg:col-span-3">
          <app-case-fees [caseId]="c.id" />
        </p-card>
      </div>
    }
  `,
})
export class CaseView implements OnInit {
  private svc = inject(CasesService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);

  item = signal<CaseDetail | null>(null);
  history = signal<CaseHistoryItem[]>([]);
  adding = signal(false);
  noteDate = '';
  noteText = '';

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.get(id).subscribe((c) => this.item.set(c));
    this.loadHistory(id);
  }

  loadHistory(id: number) { this.svc.history(id).subscribe((h) => this.history.set(h)); }

  toggleStar(c: CaseDetail) {
    this.svc.star(c.id, !c.isStarred).subscribe(() => this.svc.get(c.id).subscribe((x) => this.item.set(x)));
  }

  addNote(id: number) {
    this.adding.set(true);
    this.svc.addNote(id, this.noteDate, this.noteText).subscribe({
      next: () => { this.adding.set(false); this.noteText = ''; this.loadHistory(id); },
      error: () => this.adding.set(false),
    });
  }
}
