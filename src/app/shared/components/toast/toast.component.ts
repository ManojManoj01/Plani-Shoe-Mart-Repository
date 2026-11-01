import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { ToastService, Toast } from '../../../core/services/toast.service';
=======
import { ToastService } from '../../../core/services/toast.service';
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
<<<<<<< HEAD
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in-right"
          [ngClass]="{
            'bg-emerald-900/90 text-white border-emerald-700': toast.type === 'success',
            'bg-rose-900/90 text-white border-rose-700': toast.type === 'error',
            'bg-slate-900/95 text-white border-slate-700': toast.type === 'info',
            'bg-amber-900/90 text-white border-amber-700': toast.type === 'warning'
          }">
          
          <!-- Icon -->
          <div class="shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
=======
          class="pointer-events-auto flex items-start p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in-right"
          [ngClass]="{
            'bg-emerald-50/95 border-emerald-300 text-emerald-900': toast.type === 'success',
            'bg-rose-50/95 border-rose-300 text-rose-900': toast.type === 'error',
            'bg-amber-50/95 border-amber-300 text-amber-900': toast.type === 'warning',
            'bg-sky-50/95 border-sky-300 text-sky-900': toast.type === 'info'
          }"
        >
          <!-- Icon -->
          <div class="mr-3 flex-shrink-0 mt-0.5">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else {
              <svg class="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 text-sm">
            @if (toast.title) {
<<<<<<< HEAD
              <div class="font-semibold text-xs tracking-wider uppercase opacity-90">{{ toast.title }}</div>
            }
            <div class="mt-0.5 leading-snug">{{ toast.message }}</div>
=======
              <p class="font-semibold text-slate-900 leading-tight mb-0.5">{{ toast.title }}</p>
            }
            <p class="text-slate-700 leading-snug">{{ toast.message }}</p>
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
          </div>

          <!-- Close button -->
          <button
            type="button"
<<<<<<< HEAD
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss notification">
=======
            (click)="toastService.remove(toast.id)"
            class="ml-2 text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
>>>>>>> 4612e5dfee97dff303e5e71abbdf1dcb739d2fe1
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  public toastService = inject(ToastService);
}
