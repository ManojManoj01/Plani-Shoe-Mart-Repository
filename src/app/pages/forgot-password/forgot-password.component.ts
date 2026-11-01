import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
          <p class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Don't worry! Enter the email address associated with your StepStyle account and we'll send you a password reset link.
          </p>
        </div>

        <!-- Success Notification Banner -->
        @if (successMessage()) {
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2 animate-fade-in">
            <div class="flex items-center gap-2 font-bold text-emerald-900">
              <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Email Dispatched</span>
            </div>
            <p class="leading-relaxed">{{ successMessage() }}</p>
          </div>
        }

        <!-- Error Notification Banner -->
        @if (errorMessage()) {
          <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="email" class="block text-xs font-bold text-slate-700 mb-1">Account Email Address</label>
            <div class="relative">
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                class="w-full pl-10 pr-4 py-3 text-xs rounded-xl border outline-none transition-all"
                [ngClass]="{
                  'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('email'),
                  'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('email')
                }"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            @if (isFieldInvalid('email')) {
              <p class="text-[11px] text-rose-600 mt-1 font-medium">Please enter a valid email address.</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
            @if (isLoading()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending Reset Link...</span>
            } @else {
              <span>Send Reset Link</span>
            }
          </button>
        </form>

        <!-- Back to Login Link -->
        <div class="text-center pt-2 border-t border-slate-100">
          <a routerLink="/login" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Sign In</span>
          </a>
        </div>

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  public isLoading = signal(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  public forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public isFieldInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const email = this.forgotForm.value.email!;
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message);
        this.toastService.success('Reset instructions sent to your email.');
        this.forgotForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Could not send reset link.');
        this.toastService.error(this.errorMessage()!);
      }
    });
  }
}
