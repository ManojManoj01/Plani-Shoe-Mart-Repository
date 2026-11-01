import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-16 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Customer Orders</h2>
          <p class="text-xs text-slate-500">
            Real customer orders received through the StepStyle footwear storefront.
          </p>
        </div>

        <button
          type="button"
          (click)="loadOrders()"
          [disabled]="isLoading()"
          class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg class="w-4 h-4" [ngClass]="{ 'animate-spin': isLoading() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Orders</span>
        </button>
      </div>

      <!-- Orders List Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        @if (isLoading()) {
          <div class="p-16 text-center">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-xs text-slate-500 font-medium">Fetching orders from backend...</p>
          </div>
        } @else if (orders().length === 0) {
          <div class="p-16 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900">No customer orders placed yet</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When shoppers purchase footwear or chappals on your store (http://localhost:4200), orders will appear here automatically.
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th scope="col" class="px-6 py-4">Order ID</th>
                  <th scope="col" class="px-6 py-4">Customer</th>
                  <th scope="col" class="px-6 py-4">Items Ordered</th>
                  <th scope="col" class="px-6 py-4">Total Amount</th>
                  <th scope="col" class="px-6 py-4">Status</th>
                  <th scope="col" class="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (order of orders(); track order.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      #{{ order.orderNumber || order.id }}
                    </td>
                    <td class="px-6 py-4">
                      <p class="font-bold text-slate-900">{{ order.customerName || 'Online Customer' }}</p>
                      <p class="text-xs text-slate-400">{{ order.customerEmail }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {{ order.items?.length || 1 }} item(s)
                      </span>
                    </td>
                    <td class="px-6 py-4 font-extrabold text-slate-900">
                      ₹{{ order.totalAmount | number:'1.2-2' }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-amber-100 text-amber-800': order.status === 'PENDING',
                          'bg-blue-100 text-blue-800': order.status === 'CONFIRMED',
                          'bg-purple-100 text-purple-800': order.status === 'SHIPPED',
                          'bg-emerald-100 text-emerald-800': order.status === 'DELIVERED',
                          'bg-rose-100 text-rose-800': order.status === 'CANCELLED'
                        }"
                      >
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-xs text-slate-500">
                      {{ order.createdAt ? (order.createdAt | date:'medium') : 'Recent' }}
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
export class OrdersComponent implements OnInit {
  private orderService = inject(AdminOrderService);
  private toastService = inject(ToastService);

  public orders = signal<Order[]>([]);
  public isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService.getOrders().subscribe({
      next: list => {
        this.orders.set(list || []);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        // Order endpoint may return 404 or empty if no orders exist yet
        this.orders.set([]);
      }
    });
  }
}
