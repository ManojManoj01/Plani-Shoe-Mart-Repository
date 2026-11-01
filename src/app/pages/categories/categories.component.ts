import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Category } from '../../core/models/product.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="space-y-6 pb-16 animate-fade-in">
      <!-- Delete Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        title="Deactivate Footwear Category"
        [message]="getDeleteMessage()"
        confirmText="Deactivate"
        [isLoading]="isDeleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="isDeleteModalOpen.set(false)"
      ></app-confirm-modal>

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Footwear Category Management</h2>
          <p class="text-xs text-slate-500">
            Create, organize, and monitor store collections with automated duplicate prevention.
          </p>
        </div>

        <button
          type="button"
          (click)="openAddModal()"
          class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Create New Category</span>
        </button>
      </div>

      <!-- Categories Grid -->
      @if (isLoading()) {
        <div class="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
          <p class="text-xs text-slate-500 font-medium">Fetching categories from Supabase...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          @for (cat of categories(); track cat.id) {
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group">
              <!-- Category Header / Image -->
              <div class="relative h-36 bg-slate-900 overflow-hidden">
                <img
                  [src]="formatImageUrl(cat.imageUrl)"
                  [alt]="cat.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

                <div class="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <h3 class="font-extrabold text-base leading-tight">{{ cat.name }}</h3>
                    <p class="text-[11px] font-mono text-orange-300">slug: {{ cat.slug }}</p>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {{ cat.productCount ?? 0 }} items
                  </span>
                </div>
              </div>

              <!-- Body -->
              <div class="p-4 flex-1 flex flex-col justify-between">
                <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {{ cat.description || 'Footwear collection for customer store browsing.' }}
                </p>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span class="inline-flex items-center gap-1 font-semibold" [ngClass]="cat.active ? 'text-emerald-700' : 'text-slate-400'">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="cat.active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ cat.active ? 'Active on store' : 'Inactive' }}
                  </span>

                  <button
                    type="button"
                    (click)="promptDelete(cat)"
                    class="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1 hover:underline"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Category Modal Dialog -->
      @if (isAddModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="isAddModalOpen.set(false)"></div>

          <div class="flex min-h-screen items-center justify-center p-4">
            <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-slate-200 p-6 sm:p-7">
              <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <h3 class="text-lg font-black text-slate-900">Create New Footwear Category</h3>
                <button type="button" (click)="isAddModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form [formGroup]="categoryForm" (ngSubmit)="onCreateCategory()" class="space-y-4">
                <!-- Name -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    (input)="onNameInput($any($event.target).value)"
                    placeholder="e.g. South Indian Kolhapuri"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                    [ngClass]="categoryForm.get('name')?.touched && categoryForm.get('name')?.invalid ? 'border-rose-400' : 'border-slate-200'"
                  />
                  @if (duplicateError()) {
                    <p class="text-xs text-rose-600 mt-1 font-bold">{{ duplicateError() }}</p>
                  }
                </div>

                <!-- Slug -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    formControlName="slug"
                    placeholder="e.g. kolhapuri"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                  <p class="text-[11px] text-slate-400 mt-1">Generated automatically or custom lowercase URL token</p>
                </div>

                <!-- Image URL -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    formControlName="imageUrl"
                    placeholder="https://images.unsplash.com/..."
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    placeholder="Brief description for customer store banner..."
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                  ></textarea>
                </div>

                <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    (click)="isAddModalOpen.set(false)"
                    class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="categoryForm.invalid || isCreating() || !!duplicateError()"
                    class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all"
                  >
                    @if (isCreating()) {
                      <span>Saving to Database...</span>
                    } @else {
                      <span>Create Category</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(AdminCategoryService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  public categories = signal<Category[]>([]);
  public isLoading = signal<boolean>(true);
  public isCreating = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);

  public isAddModalOpen = signal<boolean>(false);
  public isDeleteModalOpen = signal<boolean>(false);
  public categoryToDelete = signal<Category | null>(null);
  public duplicateError = signal<string | null>(null);

  formatImageUrl(url: string | null | undefined): string {
    if (!url || !url.trim()) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80';
    }
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `http://localhost:8080${cleanPath}`;
  }

  public categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: [''],
    description: [''],
    imageUrl: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getCategories(true).subscribe({
      next: list => {
        this.categories.set(list || []);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load categories.');
      }
    });
  }

  openAddModal(): void {
    this.categoryForm.reset({
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
    });
    this.duplicateError.set(null);
    this.isAddModalOpen.set(true);
  }

  onNameInput(name: string): void {
    if (!name) {
      this.duplicateError.set(null);
      return;
    }

    const trimmed = name.trim().toLowerCase();
    const exists = this.categories().some(c => c.name.toLowerCase() === trimmed);

    if (exists) {
      this.duplicateError.set(`Category "${name.trim()}" already exists (case-insensitive).`);
    } else {
      this.duplicateError.set(null);
      const slug = trimmed.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      this.categoryForm.patchValue({ slug }, { emitEvent: false });
    }
  }

  onCreateCategory(): void {
    if (this.categoryForm.invalid || this.duplicateError()) return;

    this.isCreating.set(true);
    const formVal = this.categoryForm.value;

    this.categoryService.createCategory({
      name: formVal.name.trim(),
      slug: formVal.slug ? formVal.slug.trim() : undefined,
      description: formVal.description ? formVal.description.trim() : undefined,
      imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : undefined
    }).subscribe({
      next: created => {
        this.isCreating.set(false);
        this.isAddModalOpen.set(false);
        this.toastService.success(`Category "${created.name}" created successfully!`);
        this.loadCategories();
      },
      error: err => {
        this.isCreating.set(false);
        this.toastService.error(err?.error?.message || 'Failed to create category.');
      }
    });
  }

  getDeleteMessage(): string {
    const name = this.categoryToDelete()?.name ?? 'this category';
    return `Are you sure you want to deactivate "${name}"? Existing products in this category will remain, but the category will not appear in filters.`;
  }

  promptDelete(category: Category): void {
    this.categoryToDelete.set(category);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.isDeleting.set(true);
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.toastService.success(`Category "${cat.name}" deactivated.`);
        this.loadCategories();
      },
      error: err => {
        this.isDeleting.set(false);
        this.toastService.error('Failed to deactivate category.');
      }
    });
  }
}
