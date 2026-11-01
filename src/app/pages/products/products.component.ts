import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, FilterCriteria } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FiltersComponent } from '../../shared/components/filters/filters.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, FiltersComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      <!-- Breadcrumbs & Title Row -->
      <div class="mb-6">
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <a routerLink="/" class="hover:text-orange-600 transition-colors">Home</a>
          <span>/</span>
          <span class="font-bold text-slate-900 capitalize">{{ currentCategoryTitle() }}</span>
        </nav>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize">
              {{ currentCategoryTitle() }}
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Showing {{ filteredProducts().length }} {{ filteredProducts().length === 1 ? 'footwear style' : 'footwear styles' }}
            </p>
          </div>

          <!-- Sort & Mobile Filter Toggle -->
          <div class="flex items-center gap-3">
            
            <!-- Mobile Filter Button -->
            <button
              (click)="showMobileFilters.set(true)"
              class="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-sm hover:border-orange-500 transition-colors">
              <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            <!-- Sort Dropdown -->
            <div class="flex items-center gap-2">
              <label for="sortDropdown" class="text-xs font-bold text-slate-500 hidden sm:inline-block">Sort By:</label>
              <select
                id="sortDropdown"
                [(ngModel)]="criteria.sortBy"
                (change)="applyCriteria(criteria)"
                class="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer">
                <option value="popularity">Popularity (Most Loved)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <!-- ACTIVE FILTER PILLS ROW -->
      @if (hasActiveFilters()) {
        <div class="flex flex-wrap items-center gap-2 mb-6 p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs">
          <span class="font-bold text-orange-900">Active Filters:</span>
          
          @if (criteria.category && criteria.category !== 'all') {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold shadow-xs">
              Category: {{ criteria.category }}
              <button (click)="criteria.category = 'all'; applyCriteria(criteria)" class="hover:text-rose-600">&times;</button>
            </span>
          }

          @if (criteria.maxPrice && criteria.maxPrice < 6000) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold shadow-xs">
              Max: ₹{{ criteria.maxPrice }}
              <button (click)="criteria.maxPrice = 6000; applyCriteria(criteria)" class="hover:text-rose-600">&times;</button>
            </span>
          }

          @for (s of criteria.sizes; track s) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold shadow-xs">
              UK {{ s }}
              <button (click)="removeSize(s)" class="hover:text-rose-600">&times;</button>
            </span>
          }

          @for (b of criteria.brands; track b) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold shadow-xs">
              {{ b }}
              <button (click)="removeBrand(b)" class="hover:text-rose-600">&times;</button>
            </span>
          }

          @if (criteria.searchQuery) {
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-orange-200 text-orange-800 font-semibold shadow-xs">
              Search: "{{ criteria.searchQuery }}"
              <button (click)="criteria.searchQuery = ''; applyCriteria(criteria)" class="hover:text-rose-600">&times;</button>
            </span>
          }

          <button
            (click)="clearAllFilters()"
            class="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 underline">
            Reset All
          </button>
        </div>
      }

      <!-- MAIN CONTENT LAYOUT: Sidebar + Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <!-- Desktop Filters Sidebar -->
        <div class="hidden lg:block lg:col-span-1 sticky top-28">
          <app-filters
            [criteria]="criteria"
            (criteriaChange)="applyCriteria($event)">
          </app-filters>
        </div>

        <!-- Product Grid -->
        <div class="lg:col-span-3">
          @if (isLoading()) {
            <div class="py-20 flex flex-col items-center justify-center gap-3">
              <div class="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-bold text-slate-500">Loading collection...</p>
            </div>
          } @else if (filteredProducts().length === 0) {
            <!-- Empty state -->
            <div class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
              <div class="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">No Footwear Matches Your Filters</h3>
              <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, clearing selected sizes or brands, or searching for other footwear types.
              </p>
              <button
                (click)="clearAllFilters()"
                class="mt-6 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors">
                Clear Filters & Show All
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (prod of filteredProducts(); track prod.id) {
                <app-product-card [product]="prod"></app-product-card>
              }
            </div>
          }
        </div>

      </div>

      <!-- MOBILE FILTERS MODAL DRAWER -->
      @if (showMobileFilters()) {
        <div
          (click)="showMobileFilters.set(false)"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden">
        </div>
        <div class="fixed top-0 right-0 bottom-0 w-84 max-w-[85vw] bg-white z-50 p-6 overflow-y-auto shadow-2xl animate-slide-in-right">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 class="font-extrabold text-slate-900 text-base">Filter Options</h3>
            <button (click)="showMobileFilters.set(false)" class="p-2 text-slate-500 hover:text-slate-900">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <app-filters
            [criteria]="criteria"
            (criteriaChange)="applyCriteria($event)">
          </app-filters>
          <button
            (click)="showMobileFilters.set(false)"
            class="w-full mt-6 py-3 bg-neutral-900 text-white text-xs font-extrabold rounded-2xl shadow-lg">
            Show {{ filteredProducts().length }} Results
          </button>
        </div>
      }

    </div>
  `
})
export class ProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  public filteredProducts = signal<Product[]>([]);
  public isLoading = signal(false);
  public showMobileFilters = signal(false);

  public criteria: FilterCriteria = {
    category: 'all',
    maxPrice: 6000,
    sizes: [],
    brands: [],
    searchQuery: '',
    sortBy: 'popularity',
    inStockOnly: false
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.criteria.category = params['category'];
      }
      if (params['q']) {
        this.criteria.searchQuery = params['q'];
      }
      if (params['sortBy']) {
        this.criteria.sortBy = params['sortBy'];
      }
      this.fetchFiltered();
    });
  }

  public currentCategoryTitle(): string {
    if (this.criteria.searchQuery) {
      return `Search: "${this.criteria.searchQuery}"`;
    }
    if (!this.criteria.category || this.criteria.category === 'all') {
      return 'All Footwear & Chappals';
    }
    const catMap: Record<string, string> = {
      men: "Men's Footwear",
      women: "Women's Footwear",
      kids: "Kids' Collection",
      sports: "Sports & Running Shoes",
      formal: "Formal & Executive Shoes",
      casual: "Casual Lifestyle",
      chappals: "Chappals & Slippers"
    };
    return catMap[this.criteria.category] || this.criteria.category;
  }

  public hasActiveFilters(): boolean {
    return (
      (this.criteria.category !== 'all' && !!this.criteria.category) ||
      (this.criteria.maxPrice !== undefined && this.criteria.maxPrice < 6000) ||
      (this.criteria.sizes && this.criteria.sizes.length > 0) ||
      (this.criteria.brands && this.criteria.brands.length > 0) ||
      (!!this.criteria.searchQuery && this.criteria.searchQuery.trim().length > 0)
    );
  }

  public applyCriteria(newCriteria: FilterCriteria): void {
    this.criteria = { ...newCriteria };
    this.fetchFiltered();
  }

  public removeSize(size: number): void {
    if (this.criteria.sizes) {
      this.criteria.sizes = this.criteria.sizes.filter(s => s !== size);
      this.fetchFiltered();
    }
  }

  public removeBrand(brand: string): void {
    if (this.criteria.brands) {
      this.criteria.brands = this.criteria.brands.filter(b => b !== brand);
      this.fetchFiltered();
    }
  }

  public clearAllFilters(): void {
    this.criteria = {
      category: 'all',
      maxPrice: 6000,
      sizes: [],
      brands: [],
      searchQuery: '',
      sortBy: 'popularity',
      inStockOnly: false
    };
    this.fetchFiltered();
  }

  private fetchFiltered(): void {
    this.isLoading.set(true);
    this.productService.filterProducts(this.criteria).subscribe(res => {
      this.filteredProducts.set(res);
      this.isLoading.set(false);
    });
  }
}
