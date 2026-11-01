import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Toast Notifications Container -->
      <app-toast></app-toast>

      <!-- Sidebar Mobile Overlay -->
      @if (isMobileMenuOpen) {
        <div class="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-sm" (click)="isMobileMenuOpen = false"></div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-slate-800 shadow-xl"
        [ngClass]="{ 'translate-x-0': isMobileMenuOpen, '-translate-x-full': !isMobileMenuOpen }"
      >
        <!-- Logo / Store Header -->
        <div class="h-20 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 font-extrabold text-xl">
            S
          </div>
          <div>
            <h1 class="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              StepStyle <span class="text-xs px-2 py-0.5 rounded-full bg-orange-600 text-white font-medium">ADMIN</span>
            </h1>
            <p class="text-xs text-slate-400 font-medium">Palani Shoes Store</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold"
            (click)="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>

          <!-- Add Product -->
          <a
            routerLink="/products/add"
            routerLinkActive="bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold"
            (click)="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </a>

          <!-- Manage Products -->
          <a
            routerLink="/products"
            routerLinkActive="bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Manage Products</span>
          </a>

          <!-- Categories -->
          <a
            routerLink="/categories"
            routerLinkActive="bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold"
            (click)="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Categories</span>
          </a>

          <!-- Orders -->
          <a
            routerLink="/orders"
            routerLinkActive="bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold"
            (click)="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Customer Orders</span>
          </a>

          <div class="pt-5 pb-2">
            <div class="h-px bg-slate-800"></div>
          </div>

          <!-- Customer Website Link -->
          <a
            href="http://localhost:4200"
            target="_blank"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40 transition-all group"
          >
            <span class="flex items-center gap-3">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Customer Website</span>
            </span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </a>
        </nav>

        <!-- User profile & Logout -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/30">
          <div class="flex items-center justify-between mb-3 px-1">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-orange-400 text-sm ring-2 ring-orange-500/30">
                {{ userInitials() }}
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-semibold text-white truncate max-w-[120px]">{{ userName() }}</p>
                <span class="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800/40">
                  ADMIN
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            (click)="logout()"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 border border-slate-700/60 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navigation Bar -->
        <header class="h-20 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10 shadow-xs">
          <div class="flex items-center gap-4">
            <!-- Mobile Toggle -->
            <button
              type="button"
              (click)="isMobileMenuOpen = !isMobileMenuOpen"
              class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Store Subtitle & Live Status -->
            <div class="hidden sm:flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Supabase Connected
              </span>
              <span class="text-xs text-slate-400 font-medium">Spring Boot REST API Active</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a
              routerLink="/products/add"
              class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02]"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Add Footwear</span>
            </a>
          </div>
        </header>

        <!-- Main View Outlet -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  public authService = inject(AdminAuthService);
  private router = inject(Router);

  public isMobileMenuOpen = false;

  userName(): string {
    const user = this.authService.currentUser();
    return user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.username ?? 'Admin');
  }

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'A';
    const first = user.firstName ? user.firstName[0] : (user.username ? user.username[0] : 'A');
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
