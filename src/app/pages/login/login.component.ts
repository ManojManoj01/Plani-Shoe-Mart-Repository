import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <app-toast></app-toast>

      <!-- Decorative Ambient Lights -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Login Card -->
      <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 animate-fade-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 items-center justify-center text-white shadow-xl shadow-orange-600/30 font-black text-2xl mb-4">
            S
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">StepStyle Footwear</h2>
          <p class="text-sm font-semibold text-orange-600 uppercase tracking-widest mt-1">Admin Portal</p>
          <p class="text-xs text-slate-500 mt-2">Palani Shoes Inventory & Store Management</p>
        </div>

        <!-- Error Message Alert -->
        @if (errorMessage) {
          <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <svg class="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1 font-medium">{{ errorMessage }}</div>
          </div>
        }

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Username or Email -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username or Admin Email
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="usernameOrEmail"
                placeholder="admin or admin@stepstyle.com"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20':
                    loginForm.get('usernameOrEmail')?.touched && loginForm.get('usernameOrEmail')?.invalid,
                  'border-slate-200 focus:border-orange-500':
                    !(loginForm.get('usernameOrEmail')?.touched && loginForm.get('usernameOrEmail')?.invalid)
                }"
              />
            </div>
            @if (loginForm.get('usernameOrEmail')?.touched && loginForm.get('usernameOrEmail')?.invalid) {
              <p class="text-xs text-rose-600 mt-1 font-medium">Please enter your admin username or email</p>
            }
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div class="relative">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all pr-10"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20':
                    loginForm.get('password')?.touched && loginForm.get('password')?.invalid,
                  'border-slate-200 focus:border-orange-500':
                    !(loginForm.get('password')?.touched && loginForm.get('password')?.invalid)
                }"
              />
              <button
                type="button"
                (click)="showPassword = !showPassword"
                class="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                @if (showPassword) {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <p class="text-xs text-rose-600 mt-1 font-medium">Password is required</p>
            }
          </div>

          <!-- Remember me & Default hint -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                formControlName="rememberMe"
                class="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Remember this session</span>
            </label>
            <span class="text-slate-400">Role-Based Server Auth</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            @if (isLoading) {
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Verifying Admin Credentials...</span>
            } @else {
              <span>Sign In to Admin Panel</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          </button>
        </form>

        <!-- Default Credentials Quick-Fill Hint -->
        <div class="mt-8 pt-6 border-t border-slate-100">
          <div class="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60 text-xs">
            <p class="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
              <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Default Seeded Admin Credentials:
            </p>
            <div class="flex items-center justify-between text-slate-600">
              <span>Username: <code class="font-mono font-bold text-slate-900 bg-slate-200/70 px-1 py-0.5 rounded">admin</code></span>
              <span>Password: <code class="font-mono font-bold text-slate-900 bg-slate-200/70 px-1 py-0.5 rounded">Password@123</code></span>
            </div>
            <button
              type="button"
              (click)="fillDefaultCredentials()"
              class="mt-2.5 w-full text-center text-xs text-orange-600 hover:text-orange-700 font-bold underline"
            >
              Click to autofill seeded credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AdminAuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public showPassword = false;
  public isLoading = false;
  public errorMessage: string | null = null;

  public loginForm: FormGroup = this.fb.group({
    usernameOrEmail: ['admin', [Validators.required]],
    password: ['Password@123', [Validators.required]],
    rememberMe: [true]
  });

  fillDefaultCredentials(): void {
    this.loginForm.patchValue({
      usernameOrEmail: 'admin',
      password: 'Password@123'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Welcome back, System Administrator!');
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Authentication failed. Please verify credentials.';
        this.toastService.error(this.errorMessage);
      }
    });
  }
}
