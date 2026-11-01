import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
<<<<<<< HEAD
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  // Clone request with Authorization header if token exists and request is to our API
  let authReq = req;
  if (token) {
    authReq = req.clone({
=======
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
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

<<<<<<< HEAD
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
=======
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        toastService.error('Session expired or unauthorized. Please log in again.');
        authService.logout();
      } else if (error.status === 403) {
        toastService.error('Access denied: You do not have administrator permissions.');
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
      }
      return throwError(() => error);
    })
  );
};
