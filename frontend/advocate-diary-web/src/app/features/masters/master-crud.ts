import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { MasterItem, MastersService } from '../../core/services/masters.service';

/** Reusable CRUD table for a simple "name + active" master. Used for Courts / Case Types / Case Stages. */
@Component({
  selector: 'app-master-crud',
  imports: [FormsModule, TableModule, ButtonModule, InputTextModule, ToggleSwitchModule, DialogModule, TagModule],
  template: `
    <div class="flex gap-2 mb-3 max-w-md">
      <input pInputText [placeholder]="'New ' + title.toLowerCase()" [(ngModel)]="newName"
             (keyup.enter)="add()" class="w-full" />
      <p-button icon="pi pi-plus" label="Add" (onClick)="add()" [disabled]="!newName.trim()" />
    </div>

    <p-table [value]="items()" [loading]="loading()" styleClass="p-datatable-sm" [tableStyle]="{ 'max-width': '40rem' }">
      <ng-template pTemplate="header">
        <tr><th>Name</th><th style="width:8rem">Status</th><th style="width:7rem"></th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-item>
        <tr>
          <td>{{ item.name }}</td>
          <td><p-tag [value]="item.isActive ? 'Active' : 'Inactive'" [severity]="item.isActive ? 'success' : 'danger'" /></td>
          <td class="text-right">
            <p-button icon="pi pi-pencil" size="small" [text]="true" (onClick)="openEdit(item)" />
            @if (item.isActive) {
              <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="remove(item)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="3" class="text-center text-surface-500 py-6">No {{ title.toLowerCase() }} yet.</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [header]="'Edit ' + title" [(visible)]="showEdit" [modal]="true" [style]="{ width: '24rem' }">
      <div class="flex flex-col gap-3 pt-2">
        <input pInputText [(ngModel)]="editName" class="w-full" />
        <div class="flex items-center gap-2"><p-toggleswitch [(ngModel)]="editActive" /> <span class="text-sm">Active</span></div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showEdit = false" />
        <p-button label="Save" [loading]="saving()" (onClick)="saveEdit()" />
      </ng-template>
    </p-dialog>
  `,
})
export class MasterCrud implements OnInit {
  @Input({ required: true }) resource!: string;
  @Input({ required: true }) title!: string;

  private svc = inject(MastersService);

  items = signal<MasterItem[]>([]);
  loading = signal(false);
  saving = signal(false);
  newName = '';

  showEdit = false;
  editId: number | null = null;
  editName = '';
  editActive = true;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.resource, true).subscribe({
      next: (r) => { this.items.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  add() {
    const name = this.newName.trim();
    if (!name) return;
    this.svc.create(this.resource, { name, isActive: true }).subscribe(() => { this.newName = ''; this.load(); });
  }

  openEdit(item: MasterItem) {
    this.editId = item.id;
    this.editName = item.name;
    this.editActive = item.isActive;
    this.showEdit = true;
  }

  saveEdit() {
    if (this.editId == null) return;
    this.saving.set(true);
    this.svc.update(this.resource, this.editId, { name: this.editName.trim(), isActive: this.editActive }).subscribe({
      next: () => { this.saving.set(false); this.showEdit = false; this.load(); },
      error: () => this.saving.set(false),
    });
  }

  remove(item: MasterItem) {
    this.svc.remove(this.resource, item.id).subscribe(() => this.load());
  }
}
