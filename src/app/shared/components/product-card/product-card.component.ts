import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="group relative bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col h-full overflow-hidden">
      
      <!-- Top Image Area -->
      <div class="relative w-full pt-[85%] bg-slate-50 overflow-hidden">
        <a [routerLink]="['/product', product.id]" class="absolute inset-0 block">
          <img
            [src]="product.images[0]"
            [alt]="product.name"
            class="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </a>

        <!-- Discount Badge -->
        @if (product.discountPercentage > 0) {
          <span class="absolute top-3 left-3 bg-orange-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md tracking-tight">
            {{ product.discountPercentage }}% OFF
          </span>
        }

        <!-- Best Seller / New badge -->
        @if (product.isBestSeller) {
          <span class="absolute top-3 right-3 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
            BESTSELLER
          </span>
        } @else if (product.isNewArrival) {
          <span class="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
            NEW
          </span>
        }

        <!-- Wishlist Heart Button -->
        <button
          (click)="toggleWishlist($event)"
          class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          [ngClass]="{ 'text-rose-500 fill-rose-500': isWishlisted() }"
          aria-label="Save to wishlist">
          <svg class="w-4 h-4" [attr.fill]="isWishlisted() ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <!-- Card Body -->
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Brand & Rating Row -->
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-bold text-orange-600 uppercase tracking-wider">{{ product.brand }}</span>
            <div class="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 text-xs font-bold">
              <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{{ product.rating }}</span>
              <span class="text-[10px] text-slate-400 font-normal">({{ product.reviewCount }})</span>
            </div>
          </div>

          <!-- Product Title -->
          <h3 class="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
            <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
          </h3>

          <!-- Description snippet -->
          <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {{ product.description }}
          </p>

          <!-- Colors & Sizes Row -->
          <div class="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <!-- Colors preview -->
            <div class="flex items-center gap-1">
              @for (c of product.colors.slice(0, 3); track c.name) {
                <span
                  class="w-3.5 h-3.5 rounded-full border border-white shadow-sm inline-block"
                  [style.background-color]="c.hex"
                  [title]="c.name">
                </span>
              }
              @if (product.colors.length > 3) {
                <span class="text-[10px] text-slate-400 font-medium">+{{ product.colors.length - 3 }}</span>
              }
            </div>

            <!-- Available sizes preview -->
            <div class="flex items-center gap-1 text-[11px] text-slate-500">
              <span class="font-semibold text-slate-700">Sizes:</span>
              <span>UK {{ product.sizes[0] }}-{{ product.sizes[product.sizes.length - 1] }}</span>
            </div>
          </div>
        </div>

        <!-- Pricing & Action Buttons -->
        <div class="mt-4 pt-3 border-t border-slate-100">
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-lg font-black text-slate-900">₹{{ product.price }}</span>
            @if (product.originalPrice > product.price) {
              <span class="text-xs text-slate-400 line-through">₹{{ product.originalPrice }}</span>
              <span class="text-[11px] font-bold text-emerald-600">Save ₹{{ product.originalPrice - product.price }}</span>
            }
          </div>

          <!-- Quantity Row on Card -->
          <div class="flex items-center justify-between py-1.5 px-0.5 mb-2.5 text-xs border-y border-slate-100">
            <span class="font-bold text-slate-700">Quantity:</span>
            <div class="flex items-center border border-slate-200 rounded-lg bg-slate-50 shadow-xs">
              <button
                type="button"
                (click)="decrementQty($event)"
                class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-orange-600 font-bold transition-colors"
                aria-label="Decrease quantity">
                &minus;
              </button>
              <span class="w-7 text-center text-xs font-bold text-slate-900">{{ cardQuantity() }}</span>
              <button
                type="button"
                (click)="incrementQty($event)"
                class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-orange-600 font-bold transition-colors"
                aria-label="Increase quantity">
                &#43;
              </button>
            </div>
          </div>

          <!-- Action Buttons Grid -->
          <div class="grid grid-cols-2 gap-2">
            <a
              [routerLink]="['/product', product.id]"
              class="w-full text-center py-2 px-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center">
              View Details
            </a>

            <button
              (click)="quickAddToCart($event)"
              class="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-xl shadow-sm transition-all">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  public isWishlisted = signal(false);
  public cardQuantity = signal<number>(1);

  public toggleWishlist(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.isWishlisted.set(!this.isWishlisted());
    if (this.isWishlisted()) {
      this.toastService.success(`Added "${this.product.name}" to your wishlist!`, 'Wishlist');
    } else {
      this.toastService.info(`Removed from wishlist.`, 'Wishlist');
    }
  }

  public incrementQty(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.cardQuantity.update(q => q + 1);
  }

  public decrementQty(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    if (this.cardQuantity() > 1) {
      this.cardQuantity.update(q => q - 1);
    }
  }

  public quickAddToCart(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    const defaultSize = this.product.sizes[0] || 7;
    const defaultColor = this.product.colors[0]?.name || 'Standard';
    this.cartService.addToCart(this.product, defaultSize, defaultColor, this.cardQuantity());
  }
}
