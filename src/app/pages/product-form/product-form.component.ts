import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProductService } from '../../core/services/product.service';
import { AdminCategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Category, ProductRequest } from '../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <a routerLink="/products" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 mb-2 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products Catalog
          </a>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">
            {{ isEditMode ? 'Edit Footwear Product' : 'Add New Footwear Product' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{ isEditMode ? 'Update existing footwear details and stock' : 'Create a new product with live Supabase database & storage persistence' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isSaving()"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </div>

      <!-- Main Form Card -->
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- 1. Basic Info Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">1</span>
            Basic Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Product Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="e.g. Palani Heritage Handcrafted Pure Leather Chappal"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('name'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('name')
                }"
              />
              @if (isFieldInvalid('name')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Product name is required (max 150 characters).</p>
              }
            </div>

            <!-- SKU / Product Code -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                SKU / Product Code
              </label>
              <input
                type="text"
                formControlName="sku"
                placeholder="e.g. SS-CHAP-001"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <p class="text-[11px] text-slate-400 mt-1">Unique stock keeping unit identifier</p>
            </div>

            <!-- Brand -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand / Manufacturer <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                formControlName="brand"
                placeholder="e.g. Palani Craft, StepStyle, Red Chief"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('brand'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('brand')
                }"
              />
              @if (isFieldInvalid('brand')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Brand name is required.</p>
              }
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category <span class="text-rose-500">*</span>
              </label>
              <select
                formControlName="category"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('category'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('category')
                }"
              >
                <option value="" disabled>Select Footwear Category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.slug">{{ cat.name }} ({{ cat.slug }})</option>
                }
              </select>
              @if (isFieldInvalid('category')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Category selection is required.</p>
              }
            </div>

            <!-- Status Toggle -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Catalog Status
              </label>
              <div class="flex items-center gap-3 pt-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="active" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span class="text-sm font-semibold" [ngClass]="productForm.get('active')?.value ? 'text-emerald-700' : 'text-slate-500'">
                  {{ productForm.get('active')?.value ? 'Active (Visible on Customer Site)' : 'Inactive (Hidden)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description <span class="text-rose-500">*</span>
            </label>
            <textarea
              formControlName="description"
              rows="4"
              placeholder="Describe materials (e.g. vegetable tanned leather), sole comfort, occasion wear, and craftsmanship..."
              class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all resize-y"
              [ngClass]="{
                'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('description'),
                'border-slate-200 focus:border-orange-500': !isFieldInvalid('description')
              }"
            ></textarea>
            @if (isFieldInvalid('description')) {
              <p class="text-xs text-rose-600 mt-1 font-medium">Description is required.</p>
            }
          </div>
        </div>

        <!-- 2. Pricing & Stock Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">2</span>
            Pricing & Inventory
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <!-- Price (Sale Price) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Selling Price (₹ INR) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  formControlName="price"
                  (input)="calculateDiscount()"
                  placeholder="899"
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  [ngClass]="{
                    'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('price'),
                    'border-slate-200 focus:border-orange-500': !isFieldInvalid('price')
                  }"
                />
              </div>
              @if (isFieldInvalid('price')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Valid price (> 0) required.</p>
              }
            </div>

            <!-- Original / MRP Price -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                MRP / Original Price (₹)
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="originalPrice"
                  (input)="calculateDiscount()"
                  placeholder="1499"
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  [ngClass]="{
                    'border-rose-400 focus:border-rose-500 bg-rose-50/20': productForm.hasError('discountInvalid'),
                    'border-slate-200 focus:border-orange-500': !productForm.hasError('discountInvalid')
                  }"
                />
              </div>
              @if (productForm.hasError('discountInvalid')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">MRP cannot be less than sale price.</p>
              } @else if (calculatedDiscount() > 0) {
                <p class="text-xs text-emerald-600 mt-1 font-bold">
                  {{ calculatedDiscount() }}% customer discount
                </p>
              }
            </div>

            <!-- Stock Quantity -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Stock Quantity <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                formControlName="stockQuantity"
                placeholder="45"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('stockQuantity'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('stockQuantity')
                }"
              />
              @if (isFieldInvalid('stockQuantity')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Whole number stock (>= 0) required.</p>
              }
            </div>
          </div>
        </div>

        <!-- 3. Sizes & Colours Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">3</span>
            Available Sizes & Colours
          </h3>

          <!-- Available Sizes -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700">
                UK Shoe Sizes <span class="text-rose-500">*</span>
              </label>
              <div class="flex gap-2">
                <button type="button" (click)="selectAllSizes()" class="text-xs text-orange-600 hover:underline font-semibold">Select Standard</button>
                <span class="text-slate-300">•</span>
                <button type="button" (click)="clearSizes()" class="text-xs text-slate-400 hover:underline">Clear</button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (size of allSizes; track size) {
                <button
                  type="button"
                  (click)="toggleSize(size)"
                  class="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                  [ngClass]="selectedSizes().includes(size) ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/30' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                >
                  UK {{ size }}
                </button>
              }
            </div>
            @if (selectedSizes().length === 0 && productForm.touched) {
              <p class="text-xs text-rose-600 mt-2 font-medium">Please select at least one available size.</p>
            }
          </div>

          <!-- Available Colours -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Available Colours <span class="text-rose-500">*</span>
            </label>
            <div class="flex flex-wrap gap-2 mb-3">
              @for (color of commonColors; track color.name) {
                <button
                  type="button"
                  (click)="toggleColor(color.name)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  [ngClass]="selectedColors().includes(color.name) ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                >
                  <span class="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" [style.backgroundColor]="color.hex"></span>
                  <span>{{ color.name }}</span>
                </button>
              }
            </div>
            <!-- Custom Color Add -->
            <div class="flex gap-2 max-w-sm">
              <input
                #customColorInput
                type="text"
                placeholder="Or type custom colour..."
                class="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                (keydown.enter)="$event.preventDefault(); addCustomColor(customColorInput.value); customColorInput.value = ''"
              />
              <button
                type="button"
                (click)="addCustomColor(customColorInput.value); customColorInput.value = ''"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Photos & Supabase Image Upload Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">4</span>
            Product Images & Supabase Storage
          </h3>

          <!-- Main Image Upload -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Main Product Image
            </label>

            <!-- Image Preview or Upload Zone -->
            @if (mainImagePreview()) {
              <div class="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-lg group">
                <img [src]="formatImageUrl(mainImagePreview())" alt="Preview" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    (click)="removeMainImage()"
                    class="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            } @else {
              <!-- Drag and drop container -->
              <div
                class="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-orange-50/20 transition-all cursor-pointer relative"
                (click)="fileInput.click()"
              >
                <input
                  #fileInput
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="hidden"
                  (change)="onFileSelected($event)"
                />
                <div class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  @if (isUploadingImage()) {
                    <svg class="w-6 h-6 animate-spin text-orange-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  } @else {
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                </div>
                <p class="text-sm font-bold text-slate-800">
                  {{ isUploadingImage() ? 'Uploading to Supabase Storage...' : 'Click or drag photo here to upload' }}
                </p>
                <p class="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP up to 5MB (stored as Supabase Storage public URL)</p>
              </div>
            }

            <!-- Manual Image URL Fallback -->
            <div class="mt-4">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Or paste public image URL:
              </label>
              <input
                type="url"
                formControlName="imageUrl"
                (input)="onUrlInput($any($event.target).value)"
                placeholder="https://images.unsplash.com/photo-..."
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions Bar -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <a
            routerLink="/products"
            class="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 text-center transition-colors"
          >
            Cancel
          </a>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              [disabled]="productForm.invalid || isSaving() || selectedSizes().length === 0"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              @if (isSaving()) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Persisting to Supabase...</span>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ isEditMode ? 'Update Product' : 'Save & Publish Product' }}</span>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(AdminProductService);
  private categoryService = inject(AdminCategoryService);
  private toastService = inject(ToastService);

  public isEditMode = false;
  public productId: number | null = null;
  public isSaving = signal<boolean>(false);
  public isUploadingImage = signal<boolean>(false);

  public categories = signal<Category[]>([]);
  public selectedSizes = signal<string[]>(['6', '7', '8', '9', '10']);
  public selectedColors = signal<string[]>(['Tan', 'Dark Brown', 'Black']);
  public mainImagePreview = signal<string | null>(null);
  public calculatedDiscount = signal<number>(0);

  public allSizes = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  public commonColors = [
    { name: 'Tan', hex: '#8B4513' },
    { name: 'Dark Brown', hex: '#4A2511' },
    { name: 'Natural Gold', hex: '#DAA520' },
    { name: 'Black', hex: '#18181B' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Olive Green', hex: '#556B2F' },
    { name: 'Grey', hex: '#64748B' }
  ];

  public productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    sku: [''],
    brand: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['chappals', [Validators.required]],
    price: [null, [Validators.required, Validators.min(0.01)]],
    originalPrice: [null],
    stockQuantity: [40, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required]],
    imageUrl: [''],
    active: [true]
  }, { validators: this.discountValidator });

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.productId = Number(idParam);
      this.loadProductForEdit(this.productId);
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: list => {
        this.categories.set(list || []);
      },
      error: err => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadProductForEdit(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: prod => {
        this.productForm.patchValue({
          name: prod.name,
          sku: prod.sku || '',
          brand: prod.brand,
          category: prod.category,
          price: prod.price,
          originalPrice: prod.originalPrice,
          stockQuantity: prod.stockQuantity,
          description: prod.description,
          imageUrl: prod.imageUrl || '',
          active: prod.active
        });

        if (prod.availableSizes && Array.isArray(prod.availableSizes)) {
          this.selectedSizes.set(prod.availableSizes.map(String));
        }
        if (prod.availableColors && Array.isArray(prod.availableColors)) {
          this.selectedColors.set(prod.availableColors);
        }
        if (prod.imageUrl) {
          this.mainImagePreview.set(prod.imageUrl);
        }
        this.calculateDiscount();
      },
      error: err => {
        this.toastService.error('Could not load product details.');
        this.router.navigate(['/products']);
      }
    });
  }

  discountValidator(group: FormGroup): any {
    const price = group.get('price')?.value;
    const originalPrice = group.get('originalPrice')?.value;

    if (price && originalPrice && Number(originalPrice) < Number(price)) {
      return { discountInvalid: true };
    }
    return null;
  }

  calculateDiscount(): void {
    const price = Number(this.productForm.get('price')?.value);
    const originalPrice = Number(this.productForm.get('originalPrice')?.value);

    if (price > 0 && originalPrice > price) {
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      this.calculatedDiscount.set(discount);
    } else {
      this.calculatedDiscount.set(0);
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!(ctrl && ctrl.touched && ctrl.invalid);
  }

  toggleSize(size: string): void {
    const current = this.selectedSizes();
    if (current.includes(size)) {
      this.selectedSizes.set(current.filter(s => s !== size));
    } else {
      this.selectedSizes.set([...current, size].sort((a, b) => Number(a) - Number(b)));
    }
  }

  selectAllSizes(): void {
    this.selectedSizes.set(['6', '7', '8', '9', '10', '11']);
  }

  clearSizes(): void {
    this.selectedSizes.set([]);
  }

  toggleColor(name: string): void {
    const current = this.selectedColors();
    if (current.includes(name)) {
      this.selectedColors.set(current.filter(c => c !== name));
    } else {
      this.selectedColors.set([...current, name]);
    }
  }

  addCustomColor(name: string): void {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (!this.selectedColors().includes(trimmed)) {
      this.selectedColors.update(c => [...c, trimmed]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File size exceeds the 5MB maximum limit.');
      return;
    }

    this.isUploadingImage.set(true);

    this.productService.uploadImage(file).subscribe({
      next: res => {
        this.isUploadingImage.set(false);
        this.mainImagePreview.set(res.imageUrl);
        this.productForm.patchValue({ imageUrl: res.imageUrl });
        this.toastService.success('Image uploaded to Supabase Storage successfully!');
      },
      error: err => {
        this.isUploadingImage.set(false);
        this.toastService.error('Failed to upload image to Supabase Storage. You can paste an image URL instead.');
      }
    });
  }

  onUrlInput(url: string): void {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/'))) {
      this.mainImagePreview.set(url);
    } else if (!url) {
      this.mainImagePreview.set(null);
    }
  }

  removeMainImage(): void {
    this.mainImagePreview.set(null);
    this.productForm.patchValue({ imageUrl: '' });
  }

  formatImageUrl(url: string | null | undefined): string {
    return this.productService.formatImageUrl(url);
  }

  resetForm(): void {
    this.productForm.reset({
      category: 'chappals',
      stockQuantity: 40,
      active: true
    });
    this.selectedSizes.set(['6', '7', '8', '9', '10']);
    this.selectedColors.set(['Tan', 'Dark Brown', 'Black']);
    this.mainImagePreview.set(null);
    this.calculatedDiscount.set(0);
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.selectedSizes().length === 0) {
      this.productForm.markAllAsTouched();
      this.toastService.error('Please correct the highlighted fields before submitting.');
      return;
    }

    this.isSaving.set(true);
    const formVal = this.productForm.value;

    const price = Number(formVal.price);
    const originalPrice = formVal.originalPrice ? Number(formVal.originalPrice) : price;
    const discountPercentage = this.calculatedDiscount();

    const requestPayload: ProductRequest = {
      name: formVal.name.trim(),
      sku: formVal.sku ? formVal.sku.trim() : undefined,
      brand: formVal.brand.trim(),
      category: formVal.category,
      price,
      originalPrice,
      discountPercentage,
      stockQuantity: Number(formVal.stockQuantity),
      description: formVal.description.trim(),
      imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : (this.mainImagePreview() || undefined),
      availableSizes: this.selectedSizes(),
      availableColors: this.selectedColors(),
      active: formVal.active
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, requestPayload).subscribe({
        next: updated => {
          this.isSaving.set(false);
          this.toastService.success(`Product "${updated.name}" updated successfully! Changes are live on customer site.`);
          this.router.navigate(['/products']);
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message || 'Failed to update product in database.');
        }
      });
    } else {
      this.productService.createProduct(requestPayload).subscribe({
        next: created => {
          this.isSaving.set(false);
          this.toastService.success(`Product "${created.name}" created successfully! Now visible on customer site.`);
          this.router.navigate(['/products']);
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message || 'Failed to create product in database.');
        }
      });
    }
  }
}
