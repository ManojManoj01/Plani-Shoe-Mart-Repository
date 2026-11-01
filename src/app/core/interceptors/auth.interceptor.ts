import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const token = authService.token();

  let modifiedReq = req;
  if (token && !req.headers.has('Authorization')) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        toastService.error('Session expired or unauthorized. Please log in again.');
        authService.logout();
      } else if (error.status === 403) {
        toastService.error('Access denied: You do not have administrator permissions.');
      }
      return throwError(() => error);
    })
  );
};
