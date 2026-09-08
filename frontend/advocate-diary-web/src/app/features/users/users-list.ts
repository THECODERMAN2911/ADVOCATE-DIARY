import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { IdentityService } from '../../core/services/identity.service';
import { ROLES, UserDto } from '../../core/models/identity.models';

@Component({
  selector: 'app-users-list',
  imports: [
    FormsModule, TableModule, DialogModule, ButtonModule, InputTextModule,
    PasswordModule, SelectModule, ToggleSwitchModule, TagModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Users</h1>
      <p-button label="Add user" icon="pi pi-plus" size="small" (onClick)="openNew()" />
    </div>

    <p-table [value]="users()" [loading]="loading()" styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-u>
        <tr>
          <td>{{ u.fullName }}</td>
          <td>{{ u.email }}</td>
          <td><p-tag [value]="u.role" severity="info" /></td>
          <td>
            <p-tag [value]="u.isActive ? 'Active' : 'Inactive'" [severity]="u.isActive ? 'success' : 'danger'" />
          </td>
          <td class="text-right">
            <p-button icon="pi pi-pencil" size="small" [text]="true" (onClick)="openEdit(u)" />
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="5" class="text-center text-surface-500 py-6">No users yet.</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [header]="editing ? 'Edit user' : 'Add user'" [(visible)]="showDialog" [modal]="true"
              [style]="{ width: '56rem', maxWidth: '96vw' }"
              [breakpoints]="{ '640px': '95vw' }"
              contentStyleClass="p-dialog-content-lg"
              styleClass="p-dialog-lg">
      <div class="flex flex-col gap-5 p-3">
        <div class="field">
          <label class="block text-sm font-medium mb-1">Full name</label>
          <input pInputText placeholder="Full name" [(ngModel)]="form.fullName" class="w-full" />
        </div>
        <div class="field">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input pInputText type="email" placeholder="Email" [(ngModel)]="form.email" [disabled]="editing" class="w-full" />
        </div>
        <div class="field">
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input pInputText placeholder="Phone" [(ngModel)]="form.phone" class="w-full" />
        </div>
        <div class="field">
          <label class="block text-sm font-medium mb-1">Role</label>
          <p-select [options]="roles" [(ngModel)]="form.role" placeholder="Role" styleClass="w-full" />
        </div>
        @if (!editing) {
          <div class="field">
            <label class="block text-sm font-medium mb-1">Temporary password</label>
            <p-password [(ngModel)]="form.password" [toggleMask]="true" placeholder="Temporary password"
                        styleClass="w-full" inputStyleClass="w-full" />
          </div>
        }
        @if (editing) {
          <div class="flex items-center gap-2 mt-1">
            <p-toggleswitch [(ngModel)]="form.isActive" /> <span class="text-sm">Active</span>
          </div>
        }
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showDialog = false" />
        <p-button label="Save" [loading]="saving()" (onClick)="save()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .p-dialog-lg .p-dialog-content {
      min-height: 30rem;
    }
    :host ::ng-deep .p-dialog-content-lg {
      padding-bottom: 1rem;
    }
  `],
})
export class UsersList implements OnInit {
  private svc = inject(IdentityService);
  readonly roles = [...ROLES];

  users = signal<UserDto[]>([]);
  loading = signal(false);
  saving = signal(false);

  showDialog = false;
  editing = false;
  editingId: number | null = null;
  form = { fullName: '', email: '', phone: '', role: 'Lawyer', password: '', isActive: true };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.listUsers().subscribe({
      next: (u) => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openNew() {
    this.editing = false;
    this.editingId = null;
    this.form = { fullName: '', email: '', phone: '', role: 'Lawyer', password: '', isActive: true };
    this.showDialog = true;
  }

  openEdit(u: UserDto) {
    this.editing = true;
    this.editingId = u.id;
    this.form = { fullName: u.fullName, email: u.email, phone: u.phone ?? '', role: u.role, password: '', isActive: u.isActive };
    this.showDialog = true;
  }

  save() {
    this.saving.set(true);
    const done = () => { this.saving.set(false); this.showDialog = false; this.load(); };
    const fail = () => this.saving.set(false);
    if (this.editing && this.editingId != null) {
      this.svc.updateUser(this.editingId, {
        fullName: this.form.fullName, phone: this.form.phone, role: this.form.role, isActive: this.form.isActive,
      }).subscribe({ next: done, error: fail });
    } else {
      this.svc.createUser({
        fullName: this.form.fullName, email: this.form.email, phone: this.form.phone,
        role: this.form.role, password: this.form.password,
      }).subscribe({ next: done, error: fail });
    }
  }
}