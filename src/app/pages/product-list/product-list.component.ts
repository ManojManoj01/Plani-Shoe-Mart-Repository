import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProductService } from '../../core/services/product.service';
import { AdminCategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Category, Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="space-y-6 pb-16 animate-fade-in">
      <!-- Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        title="Delete Footwear Product"
        [message]="getDeleteMessage()"
        confirmText="Yes, Deactivate"
        [isLoading]="isDeleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="isDeleteModalOpen.set(false)"
      ></app-confirm-modal>

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Footwear Inventory Manager</h2>
          <p class="text-xs text-slate-500">
            Search, filter, edit prices, toggle stock visibility, and update items in real time.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="loadProducts()"
            [disabled]="isLoading()"
            class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" [ngClass]="{ 'animate-spin': isLoading() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <a
            routerLink="/products/add"
            class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Product</span>
          </a>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- Search Input -->
          <div class="relative sm:col-span-2 lg:col-span-1">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search by name, brand, SKU..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Footwear Categories</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.slug">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Visibility (Active & Inactive)</option>
              <option value="active">Active Only (Customer Visible)</option>
              <option value="inactive">Inactive Only (Hidden)</option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <select
              [(ngModel)]="selectedSort"
              (ngModelChange)="onSortChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="id_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Filter Pills / Summary -->
        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <span class="font-bold text-slate-900">{{ totalElements() }}</span> products matching criteria
          </div>
          @if (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') {
            <button
              type="button"
              (click)="resetFilters()"
              class="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Clear Filters
            </button>
          }
        </div>
      </div>

      <!-- Products Table View -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        @if (isLoading()) {
          <div class="p-16 text-center">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-xs text-slate-500 font-medium">Loading footwear catalog from Supabase...</p>
          </div>
        } @else if (products().length === 0) {
          <div class="p-16 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900">No footwear products match your query</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Try adjusting your search filters or add a new shoe/chappal item to your inventory.
            </p>
            <a
              routerLink="/products/add"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              <span>+ Add Footwear</span>
            </a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th scope="col" class="px-6 py-4">Item Details</th>
                  <th scope="col" class="px-6 py-4">Category</th>
                  <th scope="col" class="px-6 py-4">Price (₹)</th>
                  <th scope="col" class="px-6 py-4">Stock</th>
                  <th scope="col" class="px-6 py-4">Visibility</th>
                  <th scope="col" class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (prod of products(); track prod.id) {
                  <tr class="hover:bg-slate-50/80 transition-colors" [ngClass]="{ 'opacity-60 bg-slate-50/40': !prod.active }">
                    <!-- Product info -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3.5">
                        <img
                          [src]="formatImageUrl(prod.imageUrl)"
                          [alt]="prod.name"
                          class="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                        />
                        <div class="min-w-0">
                          <p class="font-bold text-slate-900 truncate max-w-xs">{{ prod.name }}</p>
                          <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span class="font-semibold text-slate-700">{{ prod.brand }}</span>
                            @if (prod.sku) {
                              <span>•</span>
                              <span class="font-mono text-slate-400">{{ prod.sku }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                        {{ prod.category }}
                      </span>
                    </td>

                    <!-- Price -->
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">
                        ₹{{ prod.price | number:'1.2-2' }}
                      </div>
                      @if (prod.originalPrice > prod.price) {
                        <div class="flex items-center gap-1.5 text-xs text-slate-400">
                          <span class="line-through">₹{{ prod.originalPrice | number:'1.0-0' }}</span>
                          @if (prod.discountPercentage) {
                            <span class="text-emerald-600 font-bold text-[10px]">(-{{ prod.discountPercentage }}%)</span>
                          }
                        </div>
                      }
                    </td>

                    <!-- Stock -->
                    <td class="px-6 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        [ngClass]="prod.stockQuantity < 10 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="prod.stockQuantity < 10 ? 'bg-rose-500' : 'bg-emerald-500'"></span>
                        {{ prod.stockQuantity }} units
                      </span>
                    </td>

                    <!-- Status Toggle -->
                    <td class="px-6 py-4">
                      <button
                        type="button"
                        (click)="toggleProductActive(prod)"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                        [ngClass]="prod.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                        title="Click to toggle visibility"
                      >
                        <span class="w-2 h-2 rounded-full" [ngClass]="prod.active ? 'bg-emerald-600' : 'bg-slate-500'"></span>
                        <span>{{ prod.active ? 'Active' : 'Inactive' }}</span>
                      </button>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <!-- Edit Button -->
                        <a
                          [routerLink]="['/products/edit', prod.id]"
                          class="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit product"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </a>

                        <!-- Delete Button -->
                        <button
                          type="button"
                          (click)="promptDelete(prod)"
                          class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete / Deactivate"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              Page <span class="font-bold text-slate-900">{{ currentPage() + 1 }}</span> of <span class="font-bold text-slate-900">{{ totalPages() }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                [disabled]="currentPage() === 0"
                (click)="goToPage(currentPage() - 1)"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                [disabled]="currentPage() >= totalPages() - 1"
                (click)="goToPage(currentPage() + 1)"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(AdminProductService);
  private categoryService = inject(AdminCategoryService);
  private toastService = inject(ToastService);

  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public isLoading = signal<boolean>(true);
  public isDeleting = signal<boolean>(false);

  public searchQuery = '';
  public selectedCategory = 'all';
  public selectedStatus = 'all';
  public selectedSort = 'id_desc';

  public currentPage = signal<number>(0);
  public pageSize = 15;
  public totalPages = signal<number>(1);
  public totalElements = signal<number>(0);

  public isDeleteModalOpen = signal<boolean>(false);
  public productToDelete = signal<Product | null>(null);

  private searchTimeout: any;

  formatImageUrl(url: string | null | undefined): string {
    return this.productService.formatImageUrl(url);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: list => this.categories.set(list || [])
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const [sortBy, direction] = this.selectedSort.split('_') as [string, 'asc' | 'desc'];

    let activeParam: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') activeParam = true;
    if (this.selectedStatus === 'inactive') activeParam = false;

    this.productService.getAdminProducts({
      category: this.selectedCategory,
      active: activeParam,
      search: this.searchQuery,
      page: this.currentPage(),
      size: this.pageSize,
      sortBy,
      direction
    }).subscribe({
      next: res => {
        this.products.set(res.content || []);
        this.totalPages.set(res.totalPages || 1);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load products from server.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadProducts();
    }, 350);
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.selectedSort = 'id_desc';
    this.currentPage.set(0);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  toggleProductActive(product: Product): void {
    const newStatus = !product.active;
    this.productService.toggleStatus(product.id, newStatus).subscribe({
      next: updated => {
        this.toastService.success(
          `Product "${product.name}" is now ${newStatus ? 'Active & visible on site' : 'Inactive & hidden from site'}.`
        );
        this.loadProducts();
      },
      error: err => {
        this.toastService.error('Failed to toggle product status.');
      }
    });
  }

  getDeleteMessage(): string {
    const name = this.productToDelete()?.name ?? 'this product';
    return `Are you sure you want to deactivate "${name}"? It will immediately disappear from the live customer catalog.`;
  }

  promptDelete(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const prod = this.productToDelete();
    if (!prod) return;

    this.isDeleting.set(true);
    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.toastService.success(`Product "${prod.name}" deactivated and removed from catalog.`);
        this.loadProducts();
      },
      error: err => {
        this.isDeleting.set(false);
        this.toastService.error('Failed to delete product.');
      }
    });
  }
}
