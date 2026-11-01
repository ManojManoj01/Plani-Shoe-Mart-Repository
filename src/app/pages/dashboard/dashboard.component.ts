import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardStats, Product } from '../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Dashboard Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-600/90 text-white">
              Store Command Center
            </span>
            <span class="text-xs text-slate-300">Live Supabase Sync</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Footwear Inventory Overview</h2>
          <p class="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time management for StepStyle footwear and Palani handcrafted chappals.
          </p>
        </div>

        <div class="relative z-10 flex flex-wrap gap-2.5">
          <button
            type="button"
            (click)="loadData()"
            [disabled]="isLoading()"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 backdrop-blur-sm transition-all"
          >
            <svg class="w-4 h-4" [ngClass]="{ 'animate-spin': isLoading() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Stats</span>
          </button>
          <a
            routerLink="/products/add"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02]"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Product</span>
          </a>
        </div>

        <div class="absolute -right-20 -top-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Live Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- 1. Total Products -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between text-slate-500 mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats()?.totalProducts ?? 0 }}</span>
            <span class="text-xs text-slate-400 font-medium">SKUs active</span>
          </div>
        </div>

        <!-- 2. Total Shoes -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between text-slate-500 mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Shoes</span>
            <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats()?.totalShoes ?? 0 }}</span>
            <span class="text-xs text-purple-600 font-medium font-semibold">Men, Women, Kids</span>
          </div>
        </div>

        <!-- 3. Total Slippers & Chappals -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between text-slate-500 mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Chappals & Slippers</span>
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats()?.totalChappalsAndSlippers ?? 0 }}</span>
            <span class="text-xs text-amber-700 font-medium">Models</span>
          </div>
        </div>

        <!-- 4. HIGHLIGHT CARD: CHAPPAL STOCK INVENTORY (Live derived) -->
        <div class="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg shadow-orange-500/25 relative overflow-hidden sm:col-span-2 xl:col-span-1 border border-orange-400">
          <div class="flex items-center justify-between mb-3 text-orange-100">
            <span class="text-xs font-extrabold uppercase tracking-wider">Chappal Stock</span>
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">LIVE UNITS</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black tracking-tight text-white">{{ stats()?.chappalsInStock ?? 0 }}</span>
            <span class="text-xs text-orange-100 font-bold">in stock</span>
          </div>
          <p class="text-[11px] text-orange-100/90 mt-1 font-medium">Handcrafted & Ortho units</p>
        </div>

        <!-- 5. Total Categories -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between text-slate-500 mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Categories</span>
            <div class="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ stats()?.totalCategories ?? 0 }}</span>
            <span class="text-xs text-teal-600 font-medium">Live groups</span>
          </div>
        </div>

        <!-- 6. Low-Stock Products Alert -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow" [ngClass]="{ 'border-rose-300 bg-rose-50/30': (stats()?.lowStockCount ?? 0) > 0 }">
          <div class="flex items-center justify-between mb-3" [ngClass]="(stats()?.lowStockCount ?? 0) > 0 ? 'text-rose-600' : 'text-slate-500'">
            <span class="text-xs font-bold uppercase tracking-wider">Low Stock (&lt; 10)</span>
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" [ngClass]="(stats()?.lowStockCount ?? 0) > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black" [ngClass]="(stats()?.lowStockCount ?? 0) > 0 ? 'text-rose-600' : 'text-slate-900'">
              {{ stats()?.lowStockCount ?? 0 }}
            </span>
            <span class="text-xs font-medium" [ngClass]="(stats()?.lowStockCount ?? 0) > 0 ? 'text-rose-600' : 'text-slate-400'">
              {{ (stats()?.lowStockCount ?? 0) > 0 ? 'Urgent reorder' : 'All healthy' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Administrative Shortcuts
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            routerLink="/products/add"
            class="p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all flex items-center gap-3.5 group"
          >
            <div class="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-orange-600">Add New Footwear</p>
              <p class="text-xs text-slate-500">Upload photo & prices</p>
            </div>
          </a>

          <a
            routerLink="/products"
            class="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center gap-3.5 group"
          >
            <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-blue-600">Catalog Manager</p>
              <p class="text-xs text-slate-500">Filter, edit & stock toggle</p>
            </div>
          </a>

          <a
            routerLink="/categories"
            class="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center gap-3.5 group"
          >
            <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-teal-600">Manage Categories</p>
              <p class="text-xs text-slate-500">Add & organize collections</p>
            </div>
          </a>

          <a
            routerLink="/orders"
            class="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex items-center gap-3.5 group"
          >
            <div class="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-purple-600">Customer Orders</p>
              <p class="text-xs text-slate-500">View recent store checkout</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Recent Footwear Inventory Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Recently Updated Footwear</h3>
            <p class="text-xs text-slate-500">Latest active items synchronized with customer store</p>
          </div>
          <a
            routerLink="/products"
            class="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Products</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        @if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-xs text-slate-500 font-medium">Fetching real-time inventory from database...</p>
          </div>
        } @else if (recentProducts().length === 0) {
          <div class="p-12 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-800">No products found</p>
            <p class="text-xs text-slate-500 mt-1">Get started by creating your first product</p>
            <a
              routerLink="/products/add"
              class="inline-block mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Add First Product
            </a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th scope="col" class="px-6 py-3.5">Product</th>
                  <th scope="col" class="px-6 py-3.5">Category</th>
                  <th scope="col" class="px-6 py-3.5">Price</th>
                  <th scope="col" class="px-6 py-3.5">Stock</th>
                  <th scope="col" class="px-6 py-3.5">Status</th>
                  <th scope="col" class="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (product of recentProducts(); track product.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <!-- Product Column -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <img
                          [src]="formatImageUrl(product.imageUrl)"
                          [alt]="product.name"
                          class="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                        />
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900 truncate max-w-xs">{{ product.name }}</p>
                          <p class="text-xs text-slate-500">
                            {{ product.brand }} @if (product.sku) { <span class="font-mono text-slate-400">• {{ product.sku }}</span> }
                          </p>
                        </div>
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                        {{ product.category }}
                      </span>
                    </td>

                    <!-- Price -->
                    <td class="px-6 py-4 font-semibold text-slate-900">
                      ₹{{ product.price | number:'1.2-2' }}
                      @if (product.originalPrice > product.price) {
                        <span class="text-xs text-slate-400 line-through ml-1">₹{{ product.originalPrice | number:'1.0-0' }}</span>
                      }
                    </td>

                    <!-- Stock -->
                    <td class="px-6 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="product.stockQuantity < 10 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="product.stockQuantity < 10 ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                        {{ product.stockQuantity }} in stock
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4">
                      <span
                        class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                        [ngClass]="product.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'"
                      >
                        {{ product.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>

                    <!-- Action -->
                    <td class="px-6 py-4 text-right">
                      <a
                        [routerLink]="['/products/edit', product.id]"
                        class="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private productService = inject(AdminProductService);
  private toastService = inject(ToastService);

  public stats = signal<DashboardStats | null>(null);
  public recentProducts = signal<Product[]>([]);
  public isLoading = signal<boolean>(true);

  formatImageUrl(url: string | null | undefined): string {
    return this.productService.formatImageUrl(url);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.productService.getDashboardStats().subscribe({
      next: data => {
        this.stats.set(data);
      },
      error: err => {
        console.error('Failed to load dashboard stats:', err);
        this.toastService.error('Failed to load dashboard statistics from Spring Boot backend.');
      }
    });

    this.productService.getAdminProducts({ page: 0, size: 6, sortBy: 'id', direction: 'desc' }).subscribe({
      next: res => {
        this.recentProducts.set(res.content || []);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        console.error('Failed to load recent products:', err);
      }
    });
  }
}
