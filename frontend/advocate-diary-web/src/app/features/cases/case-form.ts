import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { MasterItem, MastersService } from '../../core/services/masters.service';
import { CaseSaveRequest, CasesService } from './cases.service';

@Component({
  selector: 'app-case-form',
  imports: [
    FormsModule, DecimalPipe, ButtonModule, InputTextModule, InputNumberModule, TextareaModule,
    SelectModule, ToggleSwitchModule, CardModule, DatePickerModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">{{ id ? 'Edit Case' : 'New Case' }}</h1>
      <p-button label="Back" icon="pi pi-arrow-left" severity="secondary" [text]="true" (onClick)="router.navigate(['/cases'])" />
    </div>

    <form #f="ngForm" (ngSubmit)="save()" class="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl">
      <p-card header="Case details" styleClass="lg:col-span-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Case number *</label>
            <input pInputText [(ngModel)]="m.caseNumber" name="caseNumber" required class="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Title *</label>
            <input pInputText [(ngModel)]="m.title" name="title" required class="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Court</label>
            <p-select [options]="courts()" optionLabel="name" optionValue="id" [(ngModel)]="m.courtId" name="courtId"
                      [showClear]="true" placeholder="Select court" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Defendant</label>
            <input pInputText [(ngModel)]="m.defendant" name="defendant" class="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Case type</label>
            <p-select [options]="types()" optionLabel="name" optionValue="id" [(ngModel)]="m.caseTypeId" name="caseTypeId"
                      [showClear]="true" placeholder="Select type" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Case stage</label>
            <p-select [options]="stages()" optionLabel="name" optionValue="id" [(ngModel)]="m.caseStageId" name="caseStageId"
                      [showClear]="true" placeholder="Select stage" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Filing date</label>
            <p-datepicker [(ngModel)]="filingDate" name="filingDate" dateFormat="dd/mm/yy"
                          [maxDate]="todayDate" [showIcon]="true" iconDisplay="input" [showButtonBar]="true"
                          placeholder="Select filing date" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Previous date</label>
            <p-datepicker [(ngModel)]="previousDate" name="previousDate" dateFormat="dd/mm/yy"
                          [maxDate]="todayDate" [showIcon]="true" iconDisplay="input" [showButtonBar]="true"
                          placeholder="Select previous date" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Next hearing date</label>
            <p-datepicker [(ngModel)]="nextDate" name="nextDate" dateFormat="dd/mm/yy"
                          [minDate]="id ? undefined : todayDate" [showIcon]="true" iconDisplay="input" [showButtonBar]="true"
                          placeholder="Select next hearing date" styleClass="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Opposite lawyer</label>
            <input pInputText [(ngModel)]="m.oppositeLawyer" name="oppositeLawyer" class="w-full" /></div>
        </div>

        <h3 class="font-medium mt-5 mb-2">Party details</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Party name *</label>
            <input pInputText [(ngModel)]="m.partyName" name="partyName" #partyName="ngModel" required class="w-full" />
            @if (partyName.invalid && (partyName.dirty || f.submitted)) {
              <span class="text-xs text-red-600">Party name is required.</span>
            }</div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Email</label>
            <input pInputText [(ngModel)]="m.partyEmail" name="partyEmail" class="w-full" /></div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Phone *</label>
            <input pInputText [(ngModel)]="m.partyPhone" name="partyPhone" #partyPhone="ngModel" required class="w-full" />
            @if (partyPhone.invalid && (partyPhone.dirty || f.submitted)) {
              <span class="text-xs text-red-600">Phone number is required.</span>
            }</div>
          <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Alternate phone</label>
            <input pInputText [(ngModel)]="m.partyPhone2" name="partyPhone2" class="w-full" /></div>
          <div class="flex flex-col gap-1 sm:col-span-2"><label class="text-sm text-surface-600">Address</label>
            <input pInputText [(ngModel)]="m.partyAddress" name="partyAddress" class="w-full" /></div>
        </div>
      </p-card>

      <div class="flex flex-col gap-4">
        <p-card header="Fees">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Fee agreed</label>
              <p-inputnumber [(ngModel)]="m.feeAgreed" name="feeAgreed" mode="currency" currency="INR" locale="en-IN"
                             placeholder="0.00" [min]="0" (onFocus)="selectAll($event)" styleClass="w-full" /></div>
            <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Fee given</label>
              <p-inputnumber [(ngModel)]="feeGiven" name="feeGiven" mode="currency" currency="INR" locale="en-IN"
                             placeholder="0.00" [min]="0" [max]="m.feeAgreed" (onFocus)="selectAll($event)" styleClass="w-full" /></div>
            <p class="text-xs text-surface-500">Balance due: ₹{{ (m.feeAgreed || 0) - (feeGiven || 0) | number: '1.2-2' }}</p>
          </div>
        </p-card>
        <p-card header="Notifications & tags">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2"><p-toggleswitch [(ngModel)]="m.emailOptIn" name="emailOptIn" /> <span class="text-sm">Email the party on changes</span></div>
            <div class="flex items-center gap-2"><p-toggleswitch [(ngModel)]="m.smsOptIn" name="smsOptIn" /> <span class="text-sm">SMS the party on changes</span></div>
            <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Tags</label>
              <input pInputText [(ngModel)]="m.tags" name="tags" class="w-full" /></div>
            <div class="flex flex-col gap-1"><label class="text-sm text-surface-600">Remarks</label>
              <textarea pTextarea [(ngModel)]="m.remarks" name="remarks" rows="3" class="w-full"></textarea></div>
          </div>
        </p-card>
        <p-button type="submit" label="Save case" icon="pi pi-check" [loading]="saving()" [disabled]="f.invalid" styleClass="w-full" />
      </div>
    </form>
  `,
})
export class CaseForm implements OnInit {
  private svc = inject(CasesService);
  private masters = inject(MastersService);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);

  id: number | null = null;
  saving = signal(false);
  courts = signal<MasterItem[]>([]);
  types = signal<MasterItem[]>([]);
  stages = signal<MasterItem[]>([]);

  /** Today's local date, used for date-picker limits. */
  readonly todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  filingDate: Date | null = null;
  previousDate: Date | null = null;
  nextDate: Date | null = null;

  /** Amount already received from the party. FeeBalance is derived from this, never edited directly. */
  feeGiven?: number;

  m: CaseSaveRequest = {
    caseNumber: '', title: '', feeAgreed: 0, feeBalance: 0, smsOptIn: false, emailOptIn: false,
  };

  /** Selects the full field contents on focus so typing replaces the "0.00" instead of appending to it. */
  selectAll(event: Event) {
    (event.target as HTMLInputElement)?.select();
  }

  ngOnInit() {
    this.masters.list('courts').subscribe((c) => this.courts.set(c));
    this.masters.list('case-types').subscribe((c) => this.types.set(c));
    this.masters.list('case-stages').subscribe((c) => this.stages.set(c));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.svc.get(this.id).subscribe((c) => {
        this.m = {
          caseNumber: c.caseNumber, title: c.title, defendant: c.defendant,
          courtId: c.courtId, caseTypeId: c.caseTypeId, caseStageId: c.caseStageId, appearingLawyerId: c.appearingLawyerId,
          filingDate: undefined, previousDate: undefined, nextDate: undefined,
          partyName: c.partyName, partyAddress: c.partyAddress, partyZip: c.partyZip,
          partyPhone: c.partyPhone, partyPhone2: c.partyPhone2, partyEmail: c.partyEmail, oppositeLawyer: c.oppositeLawyer,
          feeAgreed: c.feeAgreed, feeBalance: c.feeBalance, tags: c.tags, remarks: c.remarks,
          smsOptIn: c.smsOptIn, emailOptIn: c.emailOptIn,
        };
        this.filingDate = this.parseDate(c.filingDate);
        this.previousDate = this.parseDate(c.previousDate);
        this.nextDate = this.parseDate(c.nextDate);
        // Fee balance is stored, but the form only lets the advocate enter what's been given —
        // derive that from the existing agreed/balance figures so editing doesn't lose it.
        this.feeGiven = Math.max(0, c.feeAgreed - c.feeBalance);
      });
    }
  }

  save() {
    // Balance is always derived — never entered directly — so payments and the case record can't drift apart.
    this.m.feeBalance = Math.max(0, (this.m.feeAgreed || 0) - (this.feeGiven || 0));
    const request: CaseSaveRequest = {
      ...this.m,
      filingDate: this.formatDate(this.filingDate),
      previousDate: this.formatDate(this.previousDate),
      nextDate: this.formatDate(this.nextDate),
    };

    this.saving.set(true);
    const done = (id: number) => this.router.navigate(['/cases', id]);
    const fail = () => this.saving.set(false);
    if (this.id) {
      this.svc.update(this.id, request).subscribe({ next: (c) => done(c.id), error: fail });
    } else {
      this.svc.create(request).subscribe({ next: (c) => done(c.id), error: fail });
    }
  }

  private parseDate(value?: string) {
    if (!value) return null;
    const [year, month, day] = value.substring(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(value: Date | null) {
    if (!value) return undefined;
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}