import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <div class="flex h-screen bg-surface-50">
      <!-- Sidebar -->
      <aside class="w-64 shrink-0 bg-surface-0 border-r border-surface-200 flex flex-col">
        <div class="h-14 flex items-center px-4 font-semibold text-lg border-b border-surface-200">
          <i class="pi pi-book mr-2 text-primary"></i> Advocate Diary
        </div>
        <nav class="flex-1 p-2 space-y-1">
          @for (item of nav(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="bg-primary-50 text-primary font-medium"
               class="flex items-center gap-3 px-3 py-2 rounded-lg text-surface-700 hover:bg-surface-100 transition">
              <i class="pi {{ item.icon }}"></i><span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 flex items-center justify-between px-6 bg-surface-0 border-b border-surface-200">
          <span class="text-surface-600">Welcome, {{ auth.user()?.fullName }}</span>
          <p-button label="Logout" icon="pi pi-sign-out" severity="secondary" size="small" (onClick)="logout()" />
        </header>
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell {
  readonly auth = inject(AuthService);

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
      { label: 'My Profile', icon: 'pi-user', route: '/settings/profile' },
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

  logout() { this.auth.logout(); location.href = '/login'; }
}
