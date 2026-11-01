import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
<<<<<<< HEAD
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
=======
import { AdminAuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1

  if (authService.isLoggedIn()) {
    return true;
  }

<<<<<<< HEAD
  toastService.info('Please log in to access your Cart and Checkout.', 'Login Required');
  
  // Redirect to login with returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
=======
  router.navigate(['/login']);
  return false;
};

export const adminLoginGuard: CanActivateFn = () => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
};
