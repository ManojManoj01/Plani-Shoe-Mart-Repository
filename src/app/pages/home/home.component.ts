import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ShopLocationComponent } from '../../shared/components/shop-location/shop-location.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, ShopLocationComponent],
  template: `
    <div class="space-y-16 sm:space-y-24 pb-16 animate-fade-in">
      
      <!-- HERO BANNER SECTION -->
      <section class="relative overflow-hidden bg-neutral-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 shadow-2xl">
        <!-- Background subtle glow -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Hero Text -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-400 text-xs font-bold tracking-wide">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              FESTIVE COLLECTION 2026 &bull; PALANI SPECIAL
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
              Step Into Pure <br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
                Comfort & Style.
              </span>
            </h1>

            <p class="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              From authentic handcrafted Palani temple chappals and orthopedic daily slides to world-class athletic runners. Discover footwear crafted for every Indian foot.
            </p>

            <!-- Hero Action Buttons -->
            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a
                routerLink="/products"
                class="px-8 py-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 group">
                <span>Shop Festive Deals</span>
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                routerLink="/products"
                [queryParams]="{category: 'chappals'}"
                class="px-7 py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2">
                <span>Authentic Chappals</span>
                <span class="bg-orange-600 text-[10px] font-black px-1.5 py-0.5 rounded">NEW</span>
              </a>
            </div>

            <!-- Key Trust Metrics -->
            <div class="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md">
              <div>
                <div class="text-2xl font-black text-white">25+</div>
                <div class="text-xs text-slate-400">Years of Trust</div>
              </div>
              <div>
                <div class="text-2xl font-black text-white">50k+</div>
                <div class="text-xs text-slate-400">Happy Feet</div>
              </div>
              <div>
                <div class="text-2xl font-black text-white">100%</div>
                <div class="text-xs text-slate-400">Genuine Quality</div>
              </div>
            </div>
          </div>

          <!-- Hero Image & Badge -->
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                alt="AeroVelocity Running Shoes"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <!-- Floating Pill Card on Hero Image -->
              <div class="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Spotlight Drop</span>
                  <div class="text-sm font-bold text-white">AeroVelocity Nitro 2</div>
                  <div class="text-xs text-slate-300">₹2,499 <span class="line-through text-slate-500">₹4,299</span></div>
                </div>
                <a
                  routerLink="/products"
                  class="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-colors">
                  View &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- CATEGORIES SECTION -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div class="text-xs font-bold text-orange-600 uppercase tracking-wider">Browse by Category</div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Explore Footwear For Everyone</h2>
          </div>
          <a routerLink="/products" class="text-xs font-bold text-slate-800 hover:text-orange-600 transition-colors flex items-center gap-1 group">
            <span>View All Collections</span>
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          @for (cat of categories(); track cat.id) {
            <a
              [routerLink]="['/products']"
              [queryParams]="{category: cat.slug}"
              class="group relative bg-white rounded-2xl p-3 border border-slate-100 hover:border-orange-500/50 shadow-sm hover:shadow-lg transition-all text-center flex flex-col items-center">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2.5 bg-slate-100">
                <img
                  [src]="cat.image"
                  [alt]="cat.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 class="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {{ cat.name }}
              </h3>
              <span class="text-[10px] text-slate-400 mt-0.5">{{ cat.itemCount }} items</span>
            </a>
          }
        </div>
      </section>

      <!-- FEATURED PRODUCTS -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8">
          <div>
            <div class="text-xs font-bold text-orange-600 uppercase tracking-wider">Handpicked Selection</div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Featured Footwear</h2>
          </div>
          <a routerLink="/products" class="text-xs font-bold text-orange-600 hover:underline">See More</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (prod of featuredProducts(); track prod.id) {
            <app-product-card [product]="prod"></app-product-card>
          }
        </div>
      </section>

      <!-- SPECIAL PROMO BANNER / DEAL OF THE DAY -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl">
          <div class="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>
          
          <div class="relative z-10 max-w-2xl space-y-4">
            <span class="inline-block bg-neutral-900 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Deal of the Week
            </span>
            <h2 class="text-3xl sm:text-4xl font-black tracking-tight">
              Get Up to 45% OFF on Handcrafted Leather Chappals & Slides
            </h2>
            <p class="text-sm text-orange-100 leading-relaxed font-medium">
              Made with pure vegetable-tanned leather in Palani. Long-lasting comfort with anti-skid rubber grip, ideal for daily and festival wear.
            </p>
            <div class="pt-2 flex flex-wrap items-center gap-4">
              <a
                routerLink="/products"
                [queryParams]="{category: 'chappals'}"
                class="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95">
                Claim Offer Now &rarr;
              </a>
              <span class="text-xs font-bold text-orange-200">Use coupon: <strong class="bg-white/20 px-2 py-1 rounded text-white font-mono">STEP10</strong></span>
            </div>
          </div>
        </div>
      </section>

      <!-- NEW ARRIVALS & BEST SELLERS (Tabs or Dual Grid) -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <!-- New Arrivals -->
        <div>
          <div class="flex items-end justify-between mb-8">
            <div>
              <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fresh Drops</div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">New Arrivals</h2>
            </div>
            <a routerLink="/products" [queryParams]="{sortBy: 'newest'}" class="text-xs font-bold text-orange-600 hover:underline">View All New &rarr;</a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (prod of newArrivals(); track prod.id) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        </div>

        <!-- Best Sellers -->
        <div>
          <div class="flex items-end justify-between mb-8">
            <div>
              <div class="text-xs font-bold text-amber-600 uppercase tracking-wider">Customer Favorites</div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">Best Sellers in Store</h2>
            </div>
            <a routerLink="/products" [queryParams]="{sortBy: 'popularity'}" class="text-xs font-bold text-orange-600 hover:underline">View Top Rated &rarr;</a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (prod of bestSellers(); track prod.id) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        </div>
      </section>

      <!-- ABOUT US STORY SECTION (Target of fragment="about-us") -->
      <section id="about-us" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div class="lg:col-span-6 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
              Our Legacy
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              About StepStyle & Palani Shoes
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              Established near the sacred foothills of Palani, <strong>Palani Shoes (StepStyle)</strong> began with a clear mission: to provide comfortable, long-lasting footwear that honors South Indian craftsmanship while delivering contemporary international designs.
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">
              Whether you are walking uphill on temple stone paths, training on athletic tracks, or heading to the office in formal brogues, our footwear is designed with anatomical arch support, breathable materials, and durable anti-slip soles.
            </p>
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div class="flex items-center gap-2 font-bold text-slate-800">
                <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                <span>Direct artisan workshop</span>
              </div>
              <div class="flex items-center gap-2 font-bold text-slate-800">
                <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                <span>Doctor recommended soles</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 relative">
            <div class="w-full h-80 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
                alt="Leather craft footwear workshop"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- SHOP LOCATION SECTION (Interactive Leaflet Map + Directions) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <app-shop-location></app-shop-location>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  public categories = signal<Category[]>([]);
  public featuredProducts = signal<Product[]>([]);
  public newArrivals = signal<Product[]>([]);
  public bestSellers = signal<Product[]>([]);

  ngOnInit(): void {
    this.productService.getCategories().subscribe(c => this.categories.set(c));
    this.productService.getFeaturedProducts().subscribe(p => this.featuredProducts.set(p.slice(0, 4)));
    this.productService.getNewArrivals().subscribe(p => this.newArrivals.set(p.slice(0, 4)));
    this.productService.getBestSellers().subscribe(p => this.bestSellers.set(p.slice(0, 4)));
  }
}
