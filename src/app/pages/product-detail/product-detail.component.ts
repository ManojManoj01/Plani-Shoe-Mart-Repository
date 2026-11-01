import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    @if (isLoading()) {
      <div class="py-32 flex flex-col items-center justify-center gap-3">
        <div class="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-slate-500">Loading footwear details...</p>
      </div>
    } @else if (product()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-12">
        
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-xs text-slate-500">
          <a routerLink="/" class="hover:text-orange-600 transition-colors">Home</a>
          <span>/</span>
          <a routerLink="/products" class="hover:text-orange-600 transition-colors">Products</a>
          <span>/</span>
          <a [routerLink]="['/products']" [queryParams]="{category: product()!.category}" class="hover:text-orange-600 transition-colors capitalize">
            {{ product()!.category }}
          </a>
          <span>/</span>
          <span class="font-bold text-slate-900 truncate max-w-xs">{{ product()!.name }}</span>
        </nav>

        <!-- Main Product Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <!-- LEFT: Image Gallery -->
          <div class="lg:col-span-6 space-y-4">
            
            <!-- Main Large Image View -->
            <div class="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group">
              <img
                [src]="activeImage()"
                [alt]="product()!.name"
                class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              @if (product()!.discountPercentage > 0) {
                <span class="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                  {{ product()!.discountPercentage }}% OFF
                </span>
              }
            </div>

            <!-- Thumbnail Gallery -->
            @if (product()!.images.length > 1) {
              <div class="flex items-center gap-3 overflow-x-auto pb-2">
                @for (img of product()!.images; track img) {
                  <button
                    type="button"
                    (click)="activeImage.set(img)"
                    class="w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50"
                    [ngClass]="{
                      'border-orange-600 ring-2 ring-orange-200': activeImage() === img,
                      'border-slate-200 opacity-70 hover:opacity-100': activeImage() !== img
                    }">
                    <img [src]="img" [alt]="product()!.name" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }

          </div>

          <!-- RIGHT: Product Info & Actions -->
          <div class="lg:col-span-6 space-y-6">
            
            <!-- Brand & Rating -->
            <div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-xs font-bold text-orange-600 uppercase tracking-widest">{{ product()!.brand }}</span>
                <span class="text-xs text-slate-400 font-mono">SKU: {{ product()!.id.toUpperCase() }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {{ product()!.name }}
              </h1>

              <!-- Star Rating -->
              <div class="flex items-center gap-2 mt-2">
                <div class="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-700 text-xs font-bold">
                  <svg class="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{{ product()!.rating }}</span>
                </div>
                <span class="text-xs text-slate-500 font-medium">({{ product()!.reviewCount }} customer ratings & reviews)</span>
              </div>
            </div>

            <!-- Price & Savings -->
            <div class="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/80 flex items-baseline gap-3">
              <span class="text-3xl font-black text-slate-900">₹{{ product()!.price }}</span>
              @if (product()!.originalPrice > product()!.price) {
                <span class="text-base text-slate-400 line-through">₹{{ product()!.originalPrice }}</span>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  You save ₹{{ product()!.originalPrice - product()!.price }} ({{ product()!.discountPercentage }}% OFF)
                </span>
              }
              <span class="text-[11px] text-slate-400 block sm:inline ml-auto">Inclusive of all taxes</span>
            </div>

            <!-- Description -->
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ product()!.description }}
            </p>

            <!-- Size Selection (UK Sizes) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Size (UK / India): <strong class="text-orange-600">UK {{ selectedSize() }}</strong>
                </span>
                <span class="text-xs text-slate-400 hover:text-slate-700 cursor-pointer underline">Size Chart Guide</span>
              </div>
              <div class="grid grid-cols-6 gap-2">
                @for (size of product()!.sizes; track size) {
                  <button
                    type="button"
                    (click)="selectedSize.set(size)"
                    class="py-2.5 text-xs font-bold rounded-xl border transition-all text-center"
                    [ngClass]="{
                      'bg-neutral-900 text-white border-neutral-900 shadow-md': selectedSize() === size,
                      'bg-white text-slate-800 border-slate-200 hover:border-orange-500': selectedSize() !== size
                    }">
                    UK {{ size }}
                  </button>
                }
              </div>
            </div>

            <!-- Color Selection -->
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Shade: <strong class="text-slate-800">{{ selectedColor() }}</strong>
              </span>
              <div class="flex items-center gap-3">
                @for (c of product()!.colors; track c.name) {
                  <button
                    type="button"
                    (click)="selectedColor.set(c.name)"
                    class="flex items-center gap-2 p-1.5 rounded-full border-2 transition-all"
                    [ngClass]="{
                      'border-orange-600 bg-orange-50/50 shadow-sm': selectedColor() === c.name,
                      'border-transparent hover:border-slate-300': selectedColor() !== c.name
                    }">
                    <span class="w-6 h-6 rounded-full border border-white shadow-xs" [style.background-color]="c.hex"></span>
                    <span class="text-xs font-semibold text-slate-700 pr-2">{{ c.name }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Quantity & Stock Status -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div class="flex items-center gap-3">
                <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">Quantity:</span>
                <div class="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                  <button
                    type="button"
                    (click)="decrementQty()"
                    class="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors"
                    aria-label="Decrease quantity">
                    &minus;
                  </button>
                  <span class="w-10 text-center text-xs font-bold text-slate-900">{{ quantity() }}</span>
                  <button
                    type="button"
                    (click)="incrementQty()"
                    class="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-colors"
                    aria-label="Increase quantity">
                    &#43;
                  </button>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>In Stock &bull; Ready for store pickup or delivery</span>
              </div>
            </div>

            <!-- Action Button: Add to Cart -->
            <div class="pt-4 border-t border-slate-100">
              <button
                type="button"
                (click)="addToCart()"
                class="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-3">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Add to Cart &bull; Quantity: {{ quantity() }}</span>
              </button>
            </div>

            <!-- Key Features Checklist -->
            @if (product()!.features && product()!.features!.length > 0) {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Highlights</h4>
                <ul class="space-y-1.5 text-xs text-slate-600">
                  @for (feat of product()!.features; track feat) {
                    <li class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>{{ feat }}</span>
                    </li>
                  }
                </ul>
              </div>
            }

          </div>

        </div>

        <!-- Technical Specifications Table -->
        @if (product()!.specifications) {
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 class="text-lg font-black text-slate-900 tracking-tight">Footwear Specifications</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              @if (product()!.specifications?.material) {
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-500">Upper Material</span>
                  <span class="font-bold text-slate-800">{{ product()!.specifications?.material }}</span>
                </div>
              }
              @if (product()!.specifications?.soleMaterial) {
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-500">Sole / Cushioning</span>
                  <span class="font-bold text-slate-800">{{ product()!.specifications?.soleMaterial }}</span>
                </div>
              }
              @if (product()!.specifications?.closure) {
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-500">Fastening / Closure</span>
                  <span class="font-bold text-slate-800">{{ product()!.specifications?.closure }}</span>
                </div>
              }
              @if (product()!.specifications?.occasion) {
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-500">Ideal Occasion</span>
                  <span class="font-bold text-slate-800">{{ product()!.specifications?.occasion }}</span>
                </div>
              }
              @if (product()!.specifications?.careInstructions) {
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="font-semibold text-slate-500">Care Instructions</span>
                  <span class="font-bold text-slate-800">{{ product()!.specifications?.careInstructions }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Related Products Section -->
        @if (relatedProducts().length > 0) {
          <div class="space-y-6 pt-6">
            <div class="flex items-end justify-between">
              <div>
                <span class="text-xs font-bold text-orange-600 uppercase tracking-wider">Similar Styles</span>
                <h3 class="text-2xl font-black text-slate-900 tracking-tight mt-0.5">You May Also Like</h3>
              </div>
              <a [routerLink]="['/products']" [queryParams]="{category: product()!.category}" class="text-xs font-bold text-orange-600 hover:underline">
                View More in {{ product()!.category }} &rarr;
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (rel of relatedProducts(); track rel.id) {
                <app-product-card [product]="rel"></app-product-card>
              }
            </div>
          </div>
        }

      </div>
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  public product = signal<Product | null>(null);
  public relatedProducts = signal<Product[]>([]);
  public isLoading = signal(true);

  public activeImage = signal('');
  public selectedSize = signal<number>(7);
  public selectedColor = signal<string>('');
  public quantity = signal<number>(1);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe(prod => {
      if (prod) {
        this.product.set(prod);
        this.activeImage.set(prod.images[0]);
        this.selectedSize.set(prod.sizes[0] || 7);
        this.selectedColor.set(prod.colors[0]?.name || 'Standard');
        this.quantity.set(1);

        // Fetch related products
        this.productService.getRelatedProducts(prod.id, prod.category, 4).subscribe(rel => {
          this.relatedProducts.set(rel);
        });
      } else {
        this.router.navigate(['/products']);
      }
      this.isLoading.set(false);
    });
  }

  public incrementQty(): void {
    this.quantity.update(q => q + 1);
  }

  public decrementQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  public addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart(p, this.selectedSize(), this.selectedColor(), this.quantity());
  }
}
