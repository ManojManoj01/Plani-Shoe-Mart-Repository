import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterCriteria, Category } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      
      <!-- Header & Clear button -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 class="font-extrabold text-slate-900 text-base">Filter Footwear</h3>
        </div>
        <button
          type="button"
          (click)="clearFilters()"
          class="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
          Clear All
        </button>
      </div>

      <!-- Category Filter -->
      <div>
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Categories</h4>
        <div class="space-y-1.5">
          <label class="flex items-center justify-between text-xs font-medium text-slate-700 hover:text-orange-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
            <span class="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                [value]="'all'"
                [checked]="criteria.category === 'all' || !criteria.category"
                (change)="setCategory('all')"
                class="accent-orange-600"
              />
              All Categories
            </span>
          </label>
          @for (cat of categories; track cat.id) {
            <label class="flex items-center justify-between text-xs font-medium text-slate-700 hover:text-orange-600 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
              <span class="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  [value]="cat.slug"
                  [checked]="criteria.category === cat.slug"
                  (change)="setCategory(cat.slug)"
                  class="accent-orange-600"
                />
                {{ cat.name }}
              </span>
              <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{{ cat.itemCount }}</span>
            </label>
          }
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="pt-2 border-t border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Price Range</h4>
          <span class="text-xs font-extrabold text-orange-600">Up to ₹{{ criteria.maxPrice || 6000 }}</span>
        </div>
        <input
          type="range"
          min="300"
          max="6000"
          step="100"
          [ngModel]="criteria.maxPrice || 6000"
          (ngModelChange)="onPriceSliderChange($event)"
          class="w-full accent-orange-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
          <span>₹300</span>
          <span>₹3,000</span>
          <span>₹6,000+</span>
        </div>
      </div>

      <!-- Size Filter (UK sizes) -->
      <div class="pt-2 border-t border-slate-100">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Select Size (UK)</h4>
        <div class="grid grid-cols-4 gap-2">
          @for (size of availableSizes; track size) {
            <button
              type="button"
              (click)="toggleSize(size)"
              class="py-2 text-xs font-bold rounded-xl border transition-all text-center"
              [ngClass]="{
                'bg-neutral-900 text-white border-neutral-900 shadow-sm': isSizeSelected(size),
                'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-500': !isSizeSelected(size)
              }">
              UK {{ size }}
            </button>
          }
        </div>
      </div>

      <!-- Brand Filter -->
      <div class="pt-2 border-t border-slate-100">
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Brand</h4>
        <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          @for (brand of availableBrands; track brand) {
            <label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-orange-600 cursor-pointer p-1 rounded hover:bg-slate-50">
              <input
                type="checkbox"
                [checked]="isBrandSelected(brand)"
                (change)="toggleBrand(brand)"
                class="rounded accent-orange-600 w-3.5 h-3.5"
              />
              <span>{{ brand }}</span>
            </label>
          }
        </div>
      </div>

      <!-- In Stock Toggle -->
      <div class="pt-2 border-t border-slate-100">
        <label class="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            [(ngModel)]="criteria.inStockOnly"
            (change)="emitChange()"
            class="rounded accent-orange-600 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

    </div>
  `
})
export class FiltersComponent implements OnInit {
  @Input() criteria: FilterCriteria = {
    category: 'all',
    maxPrice: 6000,
    sizes: [],
    brands: [],
    sortBy: 'popularity',
    inStockOnly: false
  };

  @Output() criteriaChange = new EventEmitter<FilterCriteria>();

  private productService = inject(ProductService);

  public categories: Category[] = [];
  public availableBrands: string[] = [];
  public availableSizes: number[] = [4, 5, 6, 7, 8, 9, 10, 11];

  ngOnInit(): void {
    this.productService.getCategories().subscribe(cats => this.categories = cats);
    this.productService.getBrands().subscribe(b => this.availableBrands = b);
  }

  public setCategory(catSlug: string): void {
    this.criteria.category = catSlug;
    this.emitChange();
  }

  public onPriceSliderChange(val: number): void {
    this.criteria.maxPrice = val;
    this.emitChange();
  }

  public isSizeSelected(size: number): boolean {
    return !!this.criteria.sizes?.includes(size);
  }

  public toggleSize(size: number): void {
    if (!this.criteria.sizes) this.criteria.sizes = [];
    const idx = this.criteria.sizes.indexOf(size);
    if (idx > -1) {
      this.criteria.sizes.splice(idx, 1);
    } else {
      this.criteria.sizes.push(size);
    }
    this.emitChange();
  }

  public isBrandSelected(brand: string): boolean {
    return !!this.criteria.brands?.includes(brand);
  }

  public toggleBrand(brand: string): void {
    if (!this.criteria.brands) this.criteria.brands = [];
    const idx = this.criteria.brands.indexOf(brand);
    if (idx > -1) {
      this.criteria.brands.splice(idx, 1);
    } else {
      this.criteria.brands.push(brand);
    }
    this.emitChange();
  }

  public clearFilters(): void {
    this.criteria = {
      category: 'all',
      maxPrice: 6000,
      sizes: [],
      brands: [],
      searchQuery: '',
      sortBy: 'popularity',
      inStockOnly: false
    };
    this.emitChange();
  }

  public emitChange(): void {
    this.criteriaChange.emit({ ...this.criteria });
  }
}
