import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Restricts a route to the given roles. Usage: canActivate: [roleGuard(['FirmAdmin'])] */
export function roleGuard(roles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.user()?.role;
    if (role && roles.includes(role)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
}
