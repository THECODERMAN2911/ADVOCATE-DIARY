import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CaseDocument, DocumentsService } from './documents.service';

/** Documents panel embedded in the case view: upload, list, download, delete. */
@Component({
  selector: 'app-case-documents',
  imports: [DecimalPipe, ButtonModule],
  template: `
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 border-b border-surface-200 pb-3">
        <input #picker type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" (change)="onPick($event)" />
        <p-button label="Choose file" icon="pi pi-upload" size="small" severity="secondary" (onClick)="picker.click()" />
        <span class="text-sm text-surface-600 flex-1 truncate">{{ selected?.name || 'PDF, JPG, PNG · up to 10 MB' }}</span>
        <p-button label="Upload" icon="pi pi-check" size="small" [disabled]="!selected" [loading]="uploading()" (onClick)="upload()" />
      </div>

      @if (error()) { <p class="text-red-500 text-sm">{{ error() }}</p> }

      @for (d of docs(); track d.id) {
        <div class="flex items-center gap-2 text-sm">
          <i class="pi" [class.pi-file-pdf]="d.contentType.includes('pdf')" [class.pi-image]="!d.contentType.includes('pdf')"></i>
          <button class="text-primary hover:underline text-left flex-1 truncate" (click)="download(d)">{{ d.fileName }}</button>
          <span class="text-surface-400">{{ d.sizeBytes / 1024 | number: '1.0-0' }} KB</span>
          <p-button icon="pi pi-trash" size="small" [text]="true" severity="danger" (onClick)="remove(d)" />
        </div>
      } @empty {
        @if (!loading()) { <p class="text-surface-500 text-sm">No documents uploaded.</p> }
      }
    </div>
  `,
})
export class CaseDocuments implements OnInit {
  @Input({ required: true }) caseId!: number;
  private svc = inject(DocumentsService);

  docs = signal<CaseDocument[]>([]);
  loading = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  selected: File | null = null;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.caseId).subscribe({
      next: (d) => { this.docs.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPick(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selected = input.files?.[0] ?? null;
    this.error.set(null);
  }

  upload() {
    if (!this.selected) return;
    this.uploading.set(true);
    this.error.set(null);
    this.svc.upload(this.caseId, this.selected).subscribe({
      next: () => { this.uploading.set(false); this.selected = null; this.load(); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Upload failed'); this.uploading.set(false); },
    });
  }

  download(d: CaseDocument) {
    this.svc.download(this.caseId, d.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = d.fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  remove(d: CaseDocument) {
    this.svc.delete(this.caseId, d.id).subscribe(() => this.load());
  }
}
