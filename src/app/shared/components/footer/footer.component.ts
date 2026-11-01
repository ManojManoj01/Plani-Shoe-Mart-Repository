import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <footer class="bg-neutral-900 text-slate-300 pt-16 pb-8 border-t border-neutral-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Trust badges section -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800/80">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Free Fast Shipping</h4>
              <p class="text-xs text-slate-400">On all orders above ₹999</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">100% Genuine Footwear</h4>
              <p class="text-xs text-slate-400">Directly from certified brands</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Easy 7-Day Exchange</h4>
              <p class="text-xs text-slate-400">Hassle-free size swaps</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">Palani Walk-In Store</h4>
              <p class="text-xs text-slate-400">Experience trial & pickup</p>
            </div>
          </div>
        </div>

        <!-- Main footer columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          
          <!-- Column 1: Brand & Logo -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-3">
              <img src="assets/logo.jpg" alt="Palani Shoes" class="w-12 h-12 rounded-xl object-contain bg-white p-0.5 border border-neutral-700" />
              <div>
                <span class="text-xl font-black text-white tracking-tight">StepStyle <span class="text-orange-500">.</span></span>
                <p class="text-xs font-semibold text-orange-400 uppercase tracking-wider">Palani Shoes Store</p>
              </div>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier destination for traditional handcrafted leather chappals, orthopedic daily comfort slides, sports running shoes, and formal footwear. Rooted in Palani's rich heritage of quality craftsmanship.
            </p>
            
            <!-- Newsletter -->
            <div class="pt-2">
              <p class="text-xs font-semibold text-white mb-2">Subscribe for VIP Deals & New Shoe Drops</p>
              <form (submit)="subscribeNewsletter($event)" class="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  [(ngModel)]="newsletterEmail"
                  name="newsletterEmail"
                  placeholder="Enter your email address"
                  required
                  class="flex-1 bg-neutral-800 border border-neutral-700 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-orange-500 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  class="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0">
                  Join
                </button>
              </form>
            </div>
          </div>

          <!-- Column 2: Quick Links -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop Collections</h4>
            <ul class="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><a routerLink="/products" [queryParams]="{category: 'men'}" class="hover:text-orange-400 transition-colors">Men's Footwear</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'women'}" class="hover:text-orange-400 transition-colors">Women's Footwear</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'kids'}" class="hover:text-orange-400 transition-colors">Kids' Shoes</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'sports'}" class="hover:text-orange-400 transition-colors">Athletic & Sports</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'chappals'}" class="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1.5">
                Chappals & Slippers <span class="bg-orange-600/30 text-orange-400 text-[9px] px-1 rounded">Popular</span>
              </a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'formal'}" class="hover:text-orange-400 transition-colors">Formal & Brogues</a></li>
            </ul>
          </div>

          <!-- Column 3: Customer Care -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul class="space-y-2.5 text-xs text-slate-400 font-medium">
              <li><a routerLink="/contact" class="hover:text-orange-400 transition-colors">Store Directions & Map</a></li>
              <li><a routerLink="/cart" class="hover:text-orange-400 transition-colors">Track Order & Cart</a></li>
              <li><a routerLink="/contact" class="hover:text-orange-400 transition-colors">Size Guide & Fitting</a></li>
              <li><a routerLink="/contact" class="hover:text-orange-400 transition-colors">Exchange & Return Policy</a></li>
              <li><a routerLink="/login" class="hover:text-orange-400 transition-colors">Customer Login</a></li>
              <li><a routerLink="/forgot-password" class="hover:text-orange-400 transition-colors">Password Recovery</a></li>
            </ul>
          </div>

          <!-- Column 4: Palani Store Info -->
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Visit Our Store</h4>
            <div class="space-y-3 text-xs text-slate-400">
              <div class="flex items-start gap-2.5">
                <svg class="w-4 h-4 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{{ shopInfo.address }}</span>
              </div>
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a [href]="'tel:' + shopInfo.phone" class="hover:text-white transition-colors">{{ shopInfo.phone }}</a>
              </div>
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ shopInfo.openingHours }}</span>
              </div>
              <div class="pt-2">
                <a
                  [href]="shopInfo.googleMapsUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-[11px] font-semibold transition-colors">
                  <svg class="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Get Directions in Google Maps
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Copyright -->
        <div class="pt-8 mt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {{ currentYear }} StepStyle Footwear (Palani Shoes). All rights reserved.</p>
          <div class="flex items-center gap-4">
            <span class="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span class="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span class="hover:text-slate-400 cursor-pointer">FSSAI & BIS Certified</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  public shopInfo = environment.shopInfo;
  public currentYear = new Date().getFullYear();
  public newsletterEmail = '';
  private toastService = inject(ToastService);

  public subscribeNewsletter(e: Event): void {
    e.preventDefault();
    if (this.newsletterEmail.trim()) {
      this.toastService.success(`Thank you! ${this.newsletterEmail} has been added to our exclusive club. Check your inbox for ₹200 off!`);
      this.newsletterEmail = '';
    }
  }
}
