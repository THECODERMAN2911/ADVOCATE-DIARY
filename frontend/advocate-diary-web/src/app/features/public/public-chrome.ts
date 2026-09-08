import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/** Marketing header + footer wrapper. Pages project their content via <ng-content>. */
@Component({
  selector: 'app-public-chrome',
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-0">
      <header class="h-16 border-b border-surface-200 flex items-center px-6 gap-6 sticky top-0 bg-surface-0/90 backdrop-blur z-10">
        <a routerLink="/home" class="font-semibold text-lg flex items-center gap-2">
          <i class="pi pi-book text-primary"></i> Advocate Diary
        </a>
        <nav class="hidden md:flex gap-5 text-sm text-surface-600 flex-1">
          <a routerLink="/features" class="hover:text-primary">Features</a>
          <a routerLink="/pricing" class="hover:text-primary">Pricing</a>
          <a routerLink="/faq" class="hover:text-primary">FAQ</a>
          <a routerLink="/contact" class="hover:text-primary">Contact</a>
        </nav>
        <span class="flex-1 md:hidden"></span>
        <a routerLink="/login"><p-button label="Sign in" severity="secondary" [text]="true" size="small" /></a>
        <a routerLink="/register"><p-button label="Get started" size="small" /></a>
      </header>

      <main class="flex-1"><ng-content /></main>

      <footer class="border-t border-surface-200 py-6 px-6 text-sm text-surface-500 flex flex-wrap gap-x-6 gap-y-2 justify-between">
        <span>© Advocate Diary — Case Management for Advocates</span>
        <span class="flex gap-4">
          <a routerLink="/privacy" class="hover:text-primary">Privacy</a>
          <a routerLink="/disclaimer" class="hover:text-primary">Disclaimer</a>
          <a routerLink="/contact" class="hover:text-primary">Contact</a>
        </span>
      </footer>
    </div>
  `,
})
export class PublicChrome {}
