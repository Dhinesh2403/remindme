// src/app/core/guards/auth.guard.ts
import { inject }                from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService }          from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const token  = inject(TokenService);
  const router = inject(Router);
  const t = token.getAccessToken();
  if (t && token.isTokenValid(t)) return true;
  router.navigate(['/auth/login']);
  return false;
};
