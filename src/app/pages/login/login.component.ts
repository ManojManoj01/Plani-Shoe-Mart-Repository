import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div class="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        <!-- LEFT: Footwear Illustration & Branding side -->
        <div class="md:col-span-5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-48 h-48 bg-orange-600/30 rounded-full blur-2xl"></div>
          
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
                Step Into Premium Comfort.
              </h2>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                Log in to access your saved footwear orders, track express delivery, and enjoy members-only festival discounts.
              </p>
            </div>
          </div>

          <!-- Footwear illustration badge -->
          <div class="relative z-10 pt-8 mt-auto">
            <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-base">
                👟
              </div>
              <div>
                <div class="text-xs font-bold text-white">50,000+ Happy Customers</div>
                <div class="text-[11px] text-slate-400">Authentic chappals & sneakers</div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Login Form -->
        <div class="md:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p class="text-xs text-slate-500 mt-1">Please enter your credentials to access your account.</p>
          </div>

          <!-- Quick Test Credentials Filler -->
          <div class="p-3 bg-orange-50 border border-orange-200/70 rounded-2xl flex items-center justify-between text-xs">
            <div class="text-slate-700">
              <span class="font-bold text-orange-950">Demo Credentials:</span>
              <span class="text-[11px] block text-slate-500">demo&#64;stepstyle.com / Password123!</span>
            </div>
            <button
              type="button"
              (click)="fillDemoCredentials()"
              class="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-[11px] transition-colors">
              Auto-Fill
            </button>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <!-- Email / Username -->
            <div>
              <label for="emailOrUsername" class="block text-xs font-bold text-slate-700 mb-1">Email or Username</label>
              <div class="relative">
                <input
                  id="emailOrUsername"
                  type="text"
                  formControlName="emailOrUsername"
                  placeholder="Enter email or username"
                  class="w-full pl-10 pr-4 py-3 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('emailOrUsername'),
                    'border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white': !isFieldInvalid('emailOrUsername')
                  }"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              @if (isFieldInvalid('emailOrUsername')) {
                <p class="text-[11px] text-rose-600 mt-1 font-medium">Please enter your email or username.</p>
              }
            </div>

            <!-- Password with Show/Hide toggle -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="password" class="block text-xs font-bold text-slate-700">Password</label>
                <a routerLink="/forgot-password" class="text-xs font-bold text-orange-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-3 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('password'),
                    'border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white': !isFieldInvalid('password')
                  }"
                />
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                  aria-label="Toggle password visibility">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <p class="text-[11px] text-rose-600 mt-1 font-medium">Password must be at least 6 characters.</p>
              }
            </div>

            <!-- Remember Me checkbox -->
            <div class="flex items-center">
              <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="rounded accent-orange-600 w-4 h-4 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <!-- Login Button with Loading Spinner -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
              @if (isLoading()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              } @else {
                <span>Sign In to Account</span>
              }
            </button>

          </form>

          <!-- Link to Signup -->
          <div class="text-center pt-2 border-t border-slate-100">
            <p class="text-xs text-slate-500">
              Don't have an account yet?
              <a routerLink="/signup" class="font-extrabold text-orange-600 hover:underline ml-1">
                Create Account
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public showPassword = signal(false);
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  public loginForm = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  public isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public fillDemoCredentials(): void {
    const demo = this.authService.getDemoCredentials();
    this.loginForm.patchValue({
      emailOrUsername: demo.email,
      password: demo.pass
    });
    this.toastService.info('Demo credentials filled! Click "Sign In to Account".');
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const values = this.loginForm.value;
    this.authService.login({
      emailOrUsername: values.emailOrUsername!,
      password: values.password!,
      rememberMe: values.rememberMe ?? true
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`Welcome back, ${res.user.firstName}!`);
        
        // Navigate to returnUrl or home
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Invalid credentials. Please verify and try again.');
        this.toastService.error(this.errorMessage()!);
      }
    });
  }
}
