import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = await authService.getSession();

  if (session) {
    return true;
  }

  // Redirect to login if not logged in
  return router.createUrlTree(['/admin/login']);
};
