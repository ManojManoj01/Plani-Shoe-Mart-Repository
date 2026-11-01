import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top announcement bar -->
    <div class="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white text-xs py-2 px-4 border-b border-neutral-700/50">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">FESTIVE</span>
          <span class="font-medium text-neutral-300">Grand Festive Footwear Sale! Flat 10% OFF with code <strong class="text-orange-400">STEP10</strong></span>
        </div>
        <div class="hidden sm:flex items-center gap-4 text-neutral-400">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Palani Footsteps, Tamil Nadu
          </span>
          <span class="text-neutral-600">|</span>
          <a href="tel:+919842123456" class="hover:text-orange-400 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +91 98421 23456
          </a>
        </div>
      </div>
    </div>

    <!-- Main sticky navigation -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-4">
          
          <!-- BRAND LOGO & NAME -->
          <a routerLink="/" class="flex items-center gap-3 group shrink-0">
            <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition-transform bg-white">
              <img
                src="assets/logo.jpg"
                alt="Palani Shoes Logo"
                class="w-full h-full object-contain p-0.5"
                loading="eager"
              />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                StepStyle
                <span class="text-orange-600 font-black">.</span>
              </span>
              <span class="text-[11px] font-semibold text-slate-500 tracking-wider uppercase -mt-1 flex items-center gap-1">
                Palani Shoes
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
          </a>

          <!-- DESKTOP NAV LINKS -->
          <nav class="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-700">
            <a routerLink="/" routerLinkActive="text-orange-600 font-bold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-orange-600 transition-colors py-2">Home</a>
            <a routerLink="/products" [queryParams]="{category: 'men'}" routerLinkActive="text-orange-600" class="hover:text-orange-600 transition-colors py-2">Men</a>
            <a routerLink="/products" [queryParams]="{category: 'women'}" routerLinkActive="text-orange-600" class="hover:text-orange-600 transition-colors py-2">Women</a>
            <a routerLink="/products" [queryParams]="{category: 'kids'}" routerLinkActive="text-orange-600" class="hover:text-orange-600 transition-colors py-2">Kids</a>
            <a routerLink="/products" [queryParams]="{category: 'sports'}" routerLinkActive="text-orange-600" class="hover:text-orange-600 transition-colors py-2">Sports Shoes</a>
            <a routerLink="/products" [queryParams]="{category: 'chappals'}" routerLinkActive="text-orange-600" class="relative hover:text-orange-600 transition-colors py-2 flex items-center gap-1">
              Chappals
              <span class="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Special</span>
            </a>
            <a routerLink="/" fragment="about-us" class="hover:text-orange-600 transition-colors py-2">About Us</a>
            <a routerLink="/contact" routerLinkActive="text-orange-600" class="hover:text-orange-600 transition-colors py-2">Contact</a>
          </nav>

          <!-- SEARCH & USER ACTIONS -->
          <div class="flex items-center gap-3 sm:gap-4">
            
            <!-- SEARCH BAR (Desktop) -->
            <div class="relative hidden md:block w-52 lg:w-64">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (keyup.enter)="executeSearch()"
                placeholder="Search shoes, chappals..."
                class="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              @if (searchQuery.trim().length > 0) {
                <button
                  (click)="searchQuery = ''; searchResults = []"
                  class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }

              <!-- AUTOCOMPLETE DROPDOWN -->
              @if (searchResults.length > 0) {
                <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in max-h-80 overflow-y-auto">
                  <div class="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Matching Footwear ({{ searchResults.length }})
                  </div>
                  @for (prod of searchResults; track prod.id) {
                    <a
                      [routerLink]="['/product', prod.id]"
                      (click)="searchQuery = ''; searchResults = []"
                      class="flex items-center gap-3 p-2.5 hover:bg-orange-50/70 transition-colors border-b border-slate-50 last:border-0">
                      <img [src]="prod.images[0]" [alt]="prod.name" class="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-slate-800 truncate">{{ prod.name }}</div>
                        <div class="text-[11px] text-slate-500">{{ prod.brand }} &bull; <strong class="text-orange-600 font-bold">₹{{ prod.price }}</strong></div>
                      </div>
                    </a>
                  }
                  <button
                    (click)="executeSearch()"
                    class="w-full text-center py-2.5 bg-slate-50 hover:bg-orange-500 hover:text-white text-xs font-semibold text-slate-700 transition-colors">
                    View all results for "{{ searchQuery }}" &rarr;
                  </button>
                </div>
              }
            </div>

            <!-- CART ICON WITH ANIMATED COUNT -->
            <a
              routerLink="/cart"
              class="relative p-2.5 rounded-full text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              aria-label="View Shopping Cart">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              @if (cartService.totalQuantity() > 0) {
                <span class="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle border-2 border-white">
                  {{ cartService.totalQuantity() }}
                </span>
              }
            </a>

            <!-- USER PROFILE / AUTH -->
            <div class="relative">
              @if (authService.isLoggedIn()) {
                <div class="relative">
                  <button
                    (click)="userMenuOpen.set(!userMenuOpen())"
                    class="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="User account menu">
                    <img
                      [src]="authService.currentUser()?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'"
                      alt="User Avatar"
                      class="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
                    />
                    <span class="hidden md:inline-block text-xs font-semibold text-slate-800 max-w-[80px] truncate">
                      {{ authService.currentUser()?.firstName }}
                    </span>
                    <svg class="w-3.5 h-3.5 text-slate-500 hidden md:inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- User dropdown -->
                  @if (userMenuOpen()) {
                    <div class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div class="px-4 py-2 border-b border-slate-100">
                        <p class="text-xs font-bold text-slate-900">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</p>
                        <p class="text-[11px] text-slate-500 truncate">{{ authService.currentUser()?.email }}</p>
                      </div>
                      <a routerLink="/cart" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        My Cart ({{ cartService.totalQuantity() }})
                      </a>
                      <a routerLink="/products" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        All Collections
                      </a>
                      <button
                        (click)="logout()"
                        class="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 text-left font-medium">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <div class="flex items-center gap-2">
                  <a
                    routerLink="/login"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </a>
                  <a
                    routerLink="/signup"
                    class="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-orange-600 rounded-xl shadow-sm transition-all transform active:scale-95">
                    Sign Up
                  </a>
                </div>
              }
            </div>

            <!-- MOBILE HAMBURGER BUTTON -->
            <button
              (click)="mobileDrawerOpen.set(!mobileDrawerOpen())"
              class="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu">
              @if (!mobileDrawerOpen()) {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              } @else {
                <svg class="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            </button>

          </div>
        </div>
      </div>
    </header>

    <!-- MOBILE DRAWER OVERLAY -->
    @if (mobileDrawerOpen()) {
      <div
        (click)="mobileDrawerOpen.set(false)"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fade-in">
      </div>

      <!-- SLIDE-IN DRAWER -->
      <aside class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right">
        <div>
          <!-- Header -->
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="assets/logo.jpg" alt="Logo" class="w-9 h-9 rounded-lg object-contain border border-slate-200" />
              <div>
                <div class="font-extrabold text-sm text-slate-900">StepStyle Footwear</div>
                <div class="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Palani Shoes Store</div>
              </div>
            </div>
            <button
              (click)="mobileDrawerOpen.set(false)"
              class="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Mobile search input -->
          <div class="p-4 border-b border-slate-100">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="executeSearch(); mobileDrawerOpen.set(false)"
                placeholder="Search collection..."
                class="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Mobile Nav links -->
          <nav class="p-4 flex flex-col gap-1 text-sm font-semibold text-slate-700">
            <a routerLink="/" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Home</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'men'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Men's Footwear</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'women'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Women's Footwear</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'kids'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Kids' Collection</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'sports'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Sports & Running</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'chappals'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 text-orange-700 hover:bg-orange-100 font-bold">
              <span class="flex items-center gap-1.5">
                Chappals & Slippers
                <span class="bg-orange-600 text-white text-[9px] px-1 py-0.2 rounded">Hot</span>
              </span>
              <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/products" [queryParams]="{category: 'formal'}" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Formal Shoes</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a routerLink="/contact" (click)="mobileDrawerOpen.set(false)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600">
              <span>Contact & Store Map</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </a>
          </nav>
        </div>

        <!-- Mobile drawer footer with auth -->
        <div class="p-5 border-t border-slate-100 bg-slate-50">
          @if (authService.isLoggedIn()) {
            <div class="flex items-center gap-3 mb-4">
              <img [src]="authService.currentUser()?.avatar" class="w-10 h-10 rounded-full border border-orange-500" />
              <div>
                <p class="text-xs font-bold text-slate-900">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</p>
                <p class="text-[11px] text-slate-500">{{ authService.currentUser()?.email }}</p>
              </div>
            </div>
            <button
              (click)="logout(); mobileDrawerOpen.set(false)"
              class="w-full py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
              Log Out
            </button>
          } @else {
            <div class="flex flex-col gap-2">
              <a
                routerLink="/login"
                (click)="mobileDrawerOpen.set(false)"
                class="w-full text-center py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                Log In
              </a>
              <a
                routerLink="/signup"
                (click)="mobileDrawerOpen.set(false)"
                class="w-full text-center py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-orange-600 rounded-xl">
                Create Account
              </a>
            </div>
          }
        </div>
      </aside>
    }
  `
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  public mobileDrawerOpen = signal(false);
  public userMenuOpen = signal(false);
  public searchQuery = '';
  public searchResults: Product[] = [];

  public onSearchInput(): void {
    if (this.searchQuery.trim().length >= 2) {
      this.productService.filterProducts({ searchQuery: this.searchQuery }).subscribe(results => {
        this.searchResults = results.slice(0, 5);
      });
    } else {
      this.searchResults = [];
    }
  }

  public executeSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.router.navigate(['/products'], {
        queryParams: { q: this.searchQuery.trim() }
      });
      this.searchResults = [];
    }
  }

  public logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.userMenuOpen.set(false);
      this.searchResults = [];
    }
  }
}
