import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

// Custom validator to check if password & confirmPassword match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div class="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        <!-- LEFT: Branding Banner -->
        <div class="md:col-span-5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-orange-600/30 rounded-full blur-2xl"></div>
          
          <div class="relative z-10 space-y-4">
            <div class="flex items-center gap-3">
              <img src="assets/logo.jpg" alt="Palani Shoes" class="w-12 h-12 rounded-xl object-contain bg-white p-0.5 border border-white/20" />
              <div>
                <span class="text-xl font-black tracking-tight text-white">StepStyle <span class="text-orange-500">.</span></span>
                <p class="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Palani Shoes</p>
              </div>
            </div>

            <div class="pt-6">
              <h2 class="text-2xl font-black leading-tight text-white">
                Join 50,000+ Footwear Enthusiasts.
              </h2>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Create an account to unlock fast checkout, personalized shoe sizing recommendations, order tracking, and exclusive discounts.
              </p>
            </div>
          </div>

          <!-- Benefits -->
          <div class="relative z-10 pt-8 mt-auto space-y-2.5 text-xs text-slate-300">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Instant ₹200 welcome voucher on first order</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Saved foot sizes for instant re-ordering</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              <span>Doorstep exchange and warranty protection</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: Signup Form -->
        <div class="md:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p class="text-xs text-slate-500 mt-1">Fill in your information to register with StepStyle Footwear.</p>
          </div>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <!-- First & Last Name Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="firstName" class="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  placeholder="e.g. Manoj"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('firstName'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('firstName')
                  }"
                />
                @if (isFieldInvalid('firstName')) {
                  <p class="text-[11px] text-rose-600 mt-1">First name is required.</p>
                }
              </div>

              <div>
                <label for="lastName" class="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  placeholder="e.g. Kumar"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('lastName'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('lastName')
                  }"
                />
                @if (isFieldInvalid('lastName')) {
                  <p class="text-[11px] text-rose-600 mt-1">Last name is required.</p>
                }
              </div>
            </div>

            <!-- Username & Email Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="username" class="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  placeholder="e.g. manoj_shopper"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('username'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('username')
                  }"
                />
                @if (isFieldInvalid('username')) {
                  <p class="text-[11px] text-rose-600 mt-1">Username is required (min 3 chars).</p>
                }
              </div>

              <div>
                <label for="email" class="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="name@example.com"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('email'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('email')
                  }"
                />
                @if (isFieldInvalid('email')) {
                  <p class="text-[11px] text-rose-600 mt-1">Valid email address is required.</p>
                }
              </div>
            </div>

            <!-- Password with Show/Hide toggle -->
            <div>
              <label for="password" class="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Min 6 characters"
                  class="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('password'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('password')
                  }"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  aria-label="Toggle password visibility">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="text-[11px] text-rose-600 mt-1">Password must be at least 6 characters.</p>
              }
            </div>

            <!-- Confirm Password with Show/Hide toggle -->
            <div>
              <label for="confirmPassword" class="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Re-enter your password"
                  class="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('confirmPassword') || signupForm.errors?.['passwordMismatch'],
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('confirmPassword') && !signupForm.errors?.['passwordMismatch']
                  }"
                />
                <button
                  type="button"
                  (click)="showConfirmPassword.set(!showConfirmPassword())"
                  class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  aria-label="Toggle confirm password visibility">
                  @if (showConfirmPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              @if (signupForm.errors?.['passwordMismatch'] && (signupForm.get('confirmPassword')?.touched || signupForm.get('password')?.touched)) {
                <p class="text-[11px] text-rose-600 mt-1 font-semibold">Passwords do not match.</p>
              }
            </div>

            <!-- Terms & Conditions checkbox -->
            <div class="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                formControlName="acceptTerms"
                class="rounded accent-orange-600 w-4 h-4 mt-0.5 cursor-pointer"
              />
              <label for="terms" class="text-xs text-slate-600 cursor-pointer">
                I agree to the <span class="font-bold text-slate-900 underline">Terms of Service</span> and <span class="font-bold text-slate-900 underline">Privacy Policy</span>.
              </label>
            </div>
            @if (isFieldInvalid('acceptTerms')) {
              <p class="text-[11px] text-rose-600 font-medium">You must accept the terms to continue.</p>
            }

            <!-- Create Account Button -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
              @if (isLoading()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              } @else {
                <span>Create StepStyle Account</span>
              }
            </button>

          </form>

          <!-- Link to Login -->
          <div class="text-center pt-2 border-t border-slate-100">
            <p class="text-xs text-slate-500">
              Already have an account?
              <a routerLink="/login" class="font-extrabold text-orange-600 hover:underline ml-1">
                Sign In
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  `
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public showPassword = signal(false);
  public showConfirmPassword = signal(false);
  public isLoading = signal(false);

  public signupForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [true, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  public isFieldInvalid(field: string): boolean {
    const control = this.signupForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const val = this.signupForm.value;

    this.authService.signup({
      firstName: val.firstName!,
      lastName: val.lastName!,
      username: val.username!,
      email: val.email!,
      password: val.password!,
      confirmPassword: val.confirmPassword!,
      acceptTerms: val.acceptTerms!
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`Welcome to StepStyle, ${res.user.firstName}! Account created.`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error(err.message || 'Registration failed. Please try again.');
      }
    });
  }
}
