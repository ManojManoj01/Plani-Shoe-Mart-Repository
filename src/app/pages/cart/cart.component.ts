import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, ShippingAddress } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      <!-- Page Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Review your footwear selections, applied discounts, and delivery estimate.
          </p>
        </div>
        @if (cartService.items().length > 0) {
          <button
            type="button"
            (click)="cartService.clearCart()"
            class="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline">
            Clear Cart
          </button>
        }
      </div>

      <!-- EMPTY CART STATE -->
      @if (cartService.items().length === 0 && !completedOrder()) {
        <div class="bg-white rounded-3xl p-12 sm:p-16 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
          <div class="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="text-xl font-black text-slate-900">Your Cart is Empty</h2>
          <p class="text-xs text-slate-500 mt-2 leading-relaxed">
            Looks like you haven't added any shoes or chappals yet. Explore our handcrafted leather sandals, running shoes, and formal collections!
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <a
              routerLink="/products"
              class="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-2xl shadow-md transition-transform active:scale-95">
              Explore All Collections
            </a>
            <a
              routerLink="/products"
              [queryParams]="{category: 'chappals'}"
              class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-colors">
              Chappals & Slippers
            </a>
          </div>
        </div>
      }

      <!-- ORDER SUCCESS SCREEN -->
      @if (completedOrder()) {
        <div class="bg-white rounded-3xl p-8 sm:p-12 text-center border border-emerald-100 shadow-xl max-w-xl mx-auto space-y-6 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span class="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-wider mb-2">Order Confirmed</span>
            <h2 class="text-2xl font-black text-slate-900">Thank You For Your Order!</h2>
            <p class="text-xs text-slate-500 mt-1">
              Order ID: <strong class="text-slate-900 font-mono">{{ completedOrder()!.id }}</strong>
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2.5">
            <div class="flex justify-between">
              <span class="text-slate-500">Deliver To:</span>
              <span class="font-bold text-slate-800">{{ completedOrder()!.shippingAddress.fullName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Address:</span>
              <span class="font-medium text-slate-700 text-right max-w-[200px]">{{ completedOrder()!.shippingAddress.addressLine1 }}, {{ completedOrder()!.shippingAddress.city }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Payment Method:</span>
              <span class="font-bold text-slate-800 uppercase">{{ completedOrder()!.paymentMethod }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">Total Quantity:</span>
              <span class="font-bold text-slate-900">{{ completedOrder()!.summary.totalQuantity }} items</span>
            </div>

            <!-- Items Purchased Breakdown -->
            <div class="pt-2 border-t border-slate-200 space-y-2">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Items Purchased</span>
              @for (item of completedOrder()!.items; track item.id) {
                <div class="flex items-center justify-between text-xs py-1">
                  <div class="flex items-center gap-2">
                    <img [src]="item.product.images[0]" [alt]="item.product.name" class="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <span class="font-bold text-slate-900">{{ item.product.name }}</span>
                      <span class="text-[11px] text-slate-500 block">UK {{ item.selectedSize }} &bull; {{ item.selectedColor }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-slate-600 font-medium">Quantity: <strong class="text-slate-900">{{ item.quantity }}</strong></span>
                    <div class="text-orange-600 font-black">₹{{ item.subtotal }}</div>
                  </div>
                </div>
              }
            </div>

            <div class="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Paid / Payable:</span>
              <span class="text-orange-600">₹{{ completedOrder()!.summary.grandTotal }}</span>
            </div>
          </div>

          <p class="text-xs text-slate-500">
            A confirmation SMS and email have been dispatched. Estimated delivery: <strong>2 - 4 business days</strong>.
          </p>

          <button
            type="button"
            (click)="completedOrder.set(null)"
            routerLink="/products"
            class="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all">
            Continue Shopping &rarr;
          </button>
        </div>
      }

      <!-- ACTIVE CART ITEMS + SUMMARY -->
      @if (cartService.items().length > 0 && !completedOrder()) {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT: Items List -->
          <div class="lg:col-span-8 space-y-4">
            
            <!-- Free Shipping Progress -->
            <div class="p-4 bg-orange-50/80 rounded-2xl border border-orange-100">
              <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                @if (cartService.freeShippingRemaining() > 0) {
                  <span>Add <strong class="text-orange-600">₹{{ cartService.freeShippingRemaining() }}</strong> more for <strong class="text-emerald-600">FREE Delivery</strong>!</span>
                } @else {
                  <span class="text-emerald-700 flex items-center gap-1">
                    <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    Congratulations! You unlocked FREE Delivery!
                  </span>
                }
                <span class="text-[11px] text-slate-500">Threshold: ₹{{ cartService.freeShippingThreshold }}</span>
              </div>
              <div class="w-full bg-orange-200/60 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-orange-600 h-full rounded-full transition-all duration-500"
                  [style.width.%]="Math.min(100, (cartService.subtotal() / cartService.freeShippingThreshold) * 100)">
                </div>
              </div>
            </div>

            <!-- Items Table/Card List -->
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
              @for (item of cartService.items(); track item.id) {
                <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <!-- Product Image & Basic Info -->
                  <div class="flex items-center gap-4">
                    <img
                      [src]="item.product.images[0]"
                      [alt]="item.product.name"
                      class="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div>
                      <span class="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{{ item.product.brand }}</span>
                      <h3 class="text-sm font-bold text-slate-900 line-clamp-1 hover:text-orange-600">
                        <a [routerLink]="['/product', item.product.id]">{{ item.product.name }}</a>
                      </h3>
                      <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span class="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">Size: UK {{ item.selectedSize }}</span>
                        <span>&bull;</span>
                        <span>Color: {{ item.selectedColor }}</span>
                      </div>
                      <div class="sm:hidden text-xs font-bold text-slate-800 mt-2">
                        <span class="text-slate-600 font-medium">Quantity: <strong>{{ item.quantity }}</strong></span> &bull;
                        ₹{{ item.unitPrice }} &times; {{ item.quantity }} = <span class="text-orange-600 font-black">₹{{ item.subtotal }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Quantity Controls & Pricing (Desktop) -->
                  <div class="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
                    <!-- Stepper with Quantity: label -->
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-slate-700">Quantity:</span>
                      <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50 shadow-xs">
                        <button
                          type="button"
                          (click)="cartService.decreaseQuantity(item.id)"
                          class="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-orange-600 font-bold transition-colors"
                          aria-label="Decrease quantity">
                          &minus;
                        </button>
                        <span class="w-8 text-center text-xs font-bold text-slate-900">{{ item.quantity }}</span>
                        <button
                          type="button"
                          (click)="cartService.increaseQuantity(item.id)"
                          class="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-orange-600 font-bold transition-colors"
                          aria-label="Increase quantity">
                          &#43;
                        </button>
                      </div>
                    </div>

                    <!-- Subtotal -->
                    <div class="text-right min-w-[80px]">
                      <div class="text-sm font-black text-slate-900">₹{{ item.subtotal }}</div>
                      <div class="text-[10px] text-slate-400">₹{{ item.unitPrice }} each</div>
                    </div>

                    <!-- Remove Item Button -->
                    <button
                      type="button"
                      (click)="cartService.removeFromCart(item.id)"
                      class="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove from Cart"
                      aria-label="Remove item from cart">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                </div>
              }
            </div>

            <!-- Continue Shopping Link -->
            <div class="pt-2">
              <a routerLink="/products" class="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline">
                &larr; Continue Shopping
              </a>
            </div>

          </div>

          <!-- RIGHT: Order Summary Card -->
          <div class="lg:col-span-4 space-y-6">
            
            <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              <h2 class="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <!-- Coupon Code Section -->
              <div class="space-y-2">
                <label for="couponInput" class="text-xs font-bold text-slate-700">Promo / Coupon Code</label>
                <div class="flex items-center gap-2">
                  <input
                    id="couponInput"
                    type="text"
                    [(ngModel)]="couponCodeInput"
                    placeholder="e.g. STEP10"
                    class="flex-1 px-3 py-2 text-xs font-semibold uppercase rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    (click)="applyCoupon()"
                    class="px-4 py-2 bg-neutral-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0">
                    Apply
                  </button>
                </div>

                <!-- Active Coupon or Demo Promos -->
                @if (cartService.coupon(); as activeCoupon) {
                  <div class="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
                    <span class="flex items-center gap-1 font-bold">
                      <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                      {{ activeCoupon.code }} Applied
                    </span>
                    <button (click)="cartService.removeCoupon()" class="text-xs text-rose-600 hover:underline font-bold">Remove</button>
                  </div>
                } @else {
                  <div class="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Try:</span>
                    <button (click)="couponCodeInput = 'STEP10'; applyCoupon()" class="text-orange-600 font-bold hover:underline">STEP10 (10% OFF)</button>
                    <span>&bull;</span>
                    <button (click)="couponCodeInput = 'PALANI500'; applyCoupon()" class="text-orange-600 font-bold hover:underline">PALANI500</button>
                  </div>
                }
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div class="flex justify-between">
                  <span class="font-bold text-slate-700">Total Quantity:</span>
                  <span class="font-bold text-slate-900">{{ cartService.totalQuantity() }} {{ cartService.totalQuantity() === 1 ? 'item' : 'items' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span class="font-bold text-slate-900">₹{{ cartService.subtotal() }}</span>
                </div>

                @if (cartService.discountAmount() > 0) {
                  <div class="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>&minus; ₹{{ cartService.discountAmount() }}</span>
                  </div>
                }

                <div class="flex justify-between">
                  <span>Standard Delivery</span>
                  @if (cartService.shippingFee() === 0) {
                    <span class="font-bold text-emerald-600 uppercase">FREE</span>
                  } @else {
                    <span class="font-bold text-slate-900">₹{{ cartService.shippingFee() }}</span>
                  }
                </div>

                <div class="flex justify-between text-[11px] text-slate-400">
                  <span>Estimated GST</span>
                  <span>Included</span>
                </div>

                <div class="flex justify-between pt-3 border-t border-slate-100 text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span class="text-orange-600 text-lg">₹{{ cartService.grandTotal() }}</span>
                </div>
              </div>

              <!-- Proceed to Checkout Button -->
              <button
                type="button"
                (click)="openCheckoutModal()"
                class="w-full py-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-600/25 transition-all flex items-center justify-center gap-2">
                <span>Proceed to Checkout</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div class="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span>Guaranteed Safe & Encrypted Checkout</span>
              </div>
            </div>

          </div>

        </div>
      }

      <!-- CHECKOUT MODAL -->
      @if (showCheckoutModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 class="text-lg font-black text-slate-900">Complete Your Delivery Details</h3>
                <p class="text-xs text-slate-500">Total Quantity: <strong class="text-slate-900 font-bold">{{ cartService.totalQuantity() }}</strong> &bull; Total Payable: <strong class="text-orange-600 font-bold">₹{{ cartService.grandTotal() }}</strong></p>
              </div>
              <button (click)="showCheckoutModal.set(false)" class="p-2 text-slate-400 hover:text-slate-800">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <!-- Order Items in Buy / Checkout Module with Quantity: -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div class="flex items-center justify-between text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-200">
                <span>Selected Items ({{ cartService.items().length }})</span>
                <span class="text-slate-600">Total Quantity: <strong class="text-orange-600 font-bold">{{ cartService.totalQuantity() }}</strong></span>
              </div>
              <div class="max-h-36 overflow-y-auto space-y-2 pr-1">
                @for (item of cartService.items(); track item.id) {
                  <div class="flex items-center justify-between text-xs gap-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <img [src]="item.product.images[0]" [alt]="item.product.name" class="w-9 h-9 rounded-lg object-cover bg-white border border-slate-200 shrink-0" />
                      <div class="truncate">
                        <div class="font-bold text-slate-900 truncate">{{ item.product.name }}</div>
                        <div class="text-[11px] text-slate-500">Size UK {{ item.selectedSize }} &bull; {{ item.selectedColor }}</div>
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <div class="text-xs font-bold text-slate-800"><span class="text-slate-500 font-medium">Quantity:</span> {{ item.quantity }}</div>
                      <div class="text-[11px] font-black text-orange-600">₹{{ item.subtotal }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Checkout Form -->
            <form [formGroup]="checkoutForm" (ngSubmit)="submitOrder()" class="space-y-4">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="e.g. Manoj Kumar"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                  @if (checkoutForm.get('fullName')?.touched && checkoutForm.get('fullName')?.invalid) {
                    <p class="text-[11px] text-rose-600 mt-1">Full name is required.</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    placeholder="10-digit mobile number"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                  @if (checkoutForm.get('phone')?.touched && checkoutForm.get('phone')?.invalid) {
                    <p class="text-[11px] text-rose-600 mt-1">Valid 10-digit phone number is required.</p>
                  }
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  formControlName="addressLine1"
                  placeholder="House / Flat no, Street, Area"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                />
                @if (checkoutForm.get('addressLine1')?.touched && checkoutForm.get('addressLine1')?.invalid) {
                  <p class="text-[11px] text-rose-600 mt-1">Address is required.</p>
                }
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    formControlName="city"
                    placeholder="e.g. Palani"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    formControlName="state"
                    placeholder="Tamil Nadu"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    formControlName="pincode"
                    placeholder="624601"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <!-- Payment Method Selection -->
              <div class="pt-2">
                <label class="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
                <div class="grid grid-cols-3 gap-2">
                  <label class="flex flex-col items-center p-3 rounded-2xl border cursor-pointer transition-all"
                    [ngClass]="selectedPaymentMethod() === 'cod' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'">
                    <input type="radio" name="payMethod" value="cod" (change)="selectedPaymentMethod.set('cod')" [checked]="selectedPaymentMethod() === 'cod'" class="sr-only" />
                    <span class="text-xs font-bold text-slate-900">Cash on Delivery</span>
                    <span class="text-[10px] text-slate-500">Pay at doorstep</span>
                  </label>

                  <label class="flex flex-col items-center p-3 rounded-2xl border cursor-pointer transition-all"
                    [ngClass]="selectedPaymentMethod() === 'upi' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'">
                    <input type="radio" name="payMethod" value="upi" (change)="selectedPaymentMethod.set('upi')" [checked]="selectedPaymentMethod() === 'upi'" class="sr-only" />
                    <span class="text-xs font-bold text-slate-900">UPI / QR</span>
                    <span class="text-[10px] text-emerald-600 font-semibold">Instant & Free</span>
                  </label>

                  <label class="flex flex-col items-center p-3 rounded-2xl border cursor-pointer transition-all"
                    [ngClass]="selectedPaymentMethod() === 'card' ? 'border-orange-600 bg-orange-50/50' : 'border-slate-200 hover:bg-slate-50'">
                    <input type="radio" name="payMethod" value="card" (change)="selectedPaymentMethod.set('card')" [checked]="selectedPaymentMethod() === 'card'" class="sr-only" />
                    <span class="text-xs font-bold text-slate-900">Credit / Debit</span>
                    <span class="text-[10px] text-slate-500">Visa / Master</span>
                  </label>
                </div>
              </div>

              <!-- Submit button -->
              <div class="pt-4">
                <button
                  type="submit"
                  [disabled]="isPlacingOrder()"
                  class="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2">
                  @if (isPlacingOrder()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  } @else {
                    <span>Confirm & Buy Now &bull; Quantity: {{ cartService.totalQuantity() }} (₹{{ cartService.grandTotal() }})</span>
                  }
                </button>
              </div>

            </form>

          </div>
        </div>
      }

    </div>
  `
})
export class CartComponent {
  public cartService = inject(CartService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  public Math = Math;
  public couponCodeInput = '';
  public showCheckoutModal = signal(false);
  public isPlacingOrder = signal(false);
  public completedOrder = signal<Order | null>(null);
  public selectedPaymentMethod = signal<'cod' | 'upi' | 'card'>('cod');

  public checkoutForm = this.fb.group({
    fullName: [this.authService.currentUser() ? `${this.authService.currentUser()?.firstName} ${this.authService.currentUser()?.lastName}` : '', Validators.required],
    phone: [this.authService.currentUser()?.phone || '', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    addressLine1: ['', Validators.required],
    city: ['Palani', Validators.required],
    state: ['Tamil Nadu', Validators.required],
    pincode: ['624601', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  public applyCoupon(): void {
    if (!this.couponCodeInput.trim()) return;
    this.cartService.applyCoupon(this.couponCodeInput);
    this.couponCodeInput = '';
  }

  public openCheckoutModal(): void {
    if (this.cartService.items().length === 0) return;
    this.showCheckoutModal.set(true);
  }

  public submitOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.toastService.warning('Please complete the shipping address fields.');
      return;
    }

    this.isPlacingOrder.set(true);
    const address: ShippingAddress = this.checkoutForm.value as ShippingAddress;

    this.cartService.checkoutOrder(address, this.selectedPaymentMethod()).subscribe({
      next: (order) => {
        this.isPlacingOrder.set(false);
        this.showCheckoutModal.set(false);
        this.completedOrder.set(order);
        this.cartService.clearCart();
        this.toastService.success(`Order ${order.id} placed successfully!`, 'Order Confirmed');
      },
      error: () => {
        this.isPlacingOrder.set(false);
        this.toastService.error('Could not complete order. Please try again.');
      }
    });
  }
}
