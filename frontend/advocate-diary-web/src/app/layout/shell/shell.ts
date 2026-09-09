import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/auth/auth.service';
import { BillingService, Subscription } from '../../features/billing/billing.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  template: `
    <div class="app-shell flex h-screen">
      <!-- Sidebar -->
      <aside class="app-sidebar shrink-0 flex flex-col transition-all duration-200"
             [class.w-16]="sidebarCollapsed()" [class.w-64]="!sidebarCollapsed()">
        <div class="app-sidebar-brand h-14 flex items-center"
             [class.justify-center]="sidebarCollapsed()" [class.px-4]="!sidebarCollapsed()">
          <img src="company-logo.png" alt="Advocate Diary" class="app-brand-mark" [class.mr-2]="!sidebarCollapsed()" />
          @if (!sidebarCollapsed()) { <span class="font-semibold text-lg">Advocate Diary</span> }
          <p-button icon="pi pi-bars" [text]="true" severity="secondary" size="small"
                    [rounded]="true" pTooltip="Toggle sidebar" aria-label="Toggle sidebar"
                    [class.ml-auto]="!sidebarCollapsed()" (onClick)="toggleSidebar()" />
        </div>
        <nav class="flex-1 p-2 space-y-1">
          @for (item of nav(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="app-nav-link-active"
              class="app-nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition"
              [class.justify-center]="sidebarCollapsed()"
              [pTooltip]="sidebarCollapsed() ? item.label : undefined" tooltipPosition="right">
              <i class="pi {{ item.icon }}"></i>
              @if (!sidebarCollapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>
      </aside>

      <!-- Main -->
      <div class="app-main flex-1 flex flex-col min-w-0">
        <header class="app-topbar h-14 flex items-center justify-between px-6">
          <span class="text-sm text-surface-600">Welcome back, <strong>{{ auth.user()?.fullName }}</strong></span>
          <div class="flex items-center gap-2">
            <a routerLink="/help/faq">
              <p-button label="FAQ" icon="pi pi-question-circle" severity="secondary" [text]="true" size="small" />
            </a>
            <span class="subscription-pill" [class.subscription-pill-default]="subscriptionStatus() === 'Default'">
              <i class="pi pi-bolt"></i>{{ subscriptionStatus() }}
            </span>
            <div class="relative" (click)="$event.stopPropagation()">
              <p-button [label]="profileInitials()" [rounded]="true" severity="secondary"
                        styleClass="!w-10 !h-10 !p-0 font-semibold" aria-label="Open profile menu"
                        pTooltip="Profile" (onClick)="toggleProfileMenu()" />
              @if (profileMenuOpen()) {
                <div class="profile-menu absolute right-0 top-full mt-2 z-50 w-40">
                  <a routerLink="/settings/profile" (click)="closeProfileMenu()" class="profile-menu-item">
                    <i class="pi pi-user"></i><span>My profile</span>
                  </a>
                  <button type="button" (click)="logout()" class="profile-menu-item w-full">
                    <i class="pi pi-sign-out"></i><span>Logout</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </header>
        <main class="flex-1 overflow-auto p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell implements OnInit {
  readonly auth = inject(AuthService);
  private readonly billing = inject(BillingService);
  readonly sidebarCollapsed = signal(false);
  readonly profileMenuOpen = signal(false);
  readonly subscription = signal<Subscription | null>(null);
  readonly subscriptionStatus = computed(() => {
    const plan = this.subscription()?.planName?.toLowerCase() ?? '';
    if (plan.includes('trial') || plan.includes('free')) return 'Free trial';
    if (plan.includes('standard')) return 'Standard';
    if (plan.includes('premium')) return 'Premium';
    return 'Default';
  });
  readonly profileInitials = computed(() => {
    const name = this.auth.user()?.fullName?.trim() ?? '';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || 'U').toUpperCase();
  });
  readonly nav = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: 'Dashboard', icon: 'pi-home', route: '/dashboard' },
      { label: "Today's List", icon: 'pi-calendar-clock', route: '/diary/today' },
      { label: 'Cases', icon: 'pi-folder', route: '/cases' },
      { label: 'Previous', icon: 'pi-history', route: '/diary/previous' },
      { label: 'Calendar', icon: 'pi-calendar', route: '/calendar' },
      { label: 'Notifications', icon: 'pi-bell', route: '/notifications' },
      { label: 'Reports', icon: 'pi-chart-bar', route: '/reports' },
      { label: 'Subscription', icon: 'pi-credit-card', route: '/subscription' },
      { label: 'Refer Colleagues', icon: 'pi-users', route: '/refer-colleagues' },
    ];
    if (this.auth.user()?.role === 'FirmAdmin') {
      items.push(
        { label: 'Masters', icon: 'pi-sitemap', route: '/masters' },
        { label: 'Users', icon: 'pi-users', route: '/users' },
        { label: 'Firm Settings', icon: 'pi-building', route: '/settings/firm' },
      );
    }
    return items;
  });

  ngOnInit() {
    this.billing.subscription().subscribe({
      next: (subscription) => this.subscription.set(subscription),
      error: () => this.subscription.set(null),
    });
  }

  logout() { this.auth.logout(); location.href = '/login'; }

  toggleSidebar() { this.sidebarCollapsed.update((collapsed) => !collapsed); }

  toggleProfileMenu() { this.profileMenuOpen.update((open) => !open); }

  closeProfileMenu() { this.profileMenuOpen.set(false); }

  @HostListener('document:click')
  closeProfileMenuOnOutsideClick() { this.closeProfileMenu(); }
}
