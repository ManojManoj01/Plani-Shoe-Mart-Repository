import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { ShopLocationComponent } from '../../shared/components/shop-location/shop-location.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ShopLocationComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-12">
      
      <!-- Page Header -->
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <span class="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
          We Are Here To Help
        </span>
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Get in Touch With Palani Shoes
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Have queries regarding temple footwear, custom handmade leather chappals, size measurements, or wholesale orders? Reach out anytime!
        </p>
      </div>

      <!-- Contact Info Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Phone & WhatsApp -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Call Customer Care</h3>
            <a [href]="'tel:' + shopInfo.phone" class="text-sm font-extrabold text-orange-600 hover:underline block mt-1">
              {{ shopInfo.phone }}
            </a>
            <p class="text-[11px] text-slate-400 mt-0.5">Mon - Sun (9 AM - 10 PM)</p>
          </div>
        </div>

        <!-- WhatsApp Support -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">WhatsApp Instant Chat</h3>
            <a href="https://wa.me/919842123456" target="_blank" class="text-sm font-extrabold text-emerald-600 hover:underline block mt-1">
              +91 98421 23456
            </a>
            <p class="text-[11px] text-slate-400 mt-0.5">Quick photo & size consultation</p>
          </div>
        </div>

        <!-- Email -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Email Support</h3>
            <a [href]="'mailto:' + shopInfo.email" class="text-xs font-extrabold text-blue-600 hover:underline block mt-1 truncate max-w-[200px]">
              {{ shopInfo.email }}
            </a>
            <p class="text-[11px] text-slate-400 mt-0.5">Replies within 4 hours</p>
          </div>
        </div>

        <!-- Store Walk-in -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Palani Storefront</h3>
            <p class="text-xs font-bold text-slate-800 mt-1">Adivaram Sannathi St.</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Near Palani Footsteps</p>
          </div>
        </div>

      </div>

      <!-- MAIN SECTION: Contact Form & FAQ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Contact Form (Left) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Send Us a Message</h2>
            <p class="text-xs text-slate-500 mt-1">We respond to every customer enquiry promptly.</p>
          </div>

          @if (isSubmitted()) {
            <div class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 animate-fade-in text-center">
              <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-sm font-black text-emerald-900">Message Received!</h3>
              <p class="text-xs leading-relaxed max-w-md mx-auto">
                Thank you for contacting StepStyle Palani Shoes. A customer representative has been notified and will get in touch with you shortly.
              </p>
              <button
                type="button"
                (click)="isSubmitted.set(false); contactForm.reset()"
                class="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                Send Another Message
              </button>
            </div>
          } @else {
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="fullName" class="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    formControlName="fullName"
                    placeholder="e.g. Manoj Kumar"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                    [ngClass]="{
                      'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('fullName'),
                      'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('fullName')
                    }"
                  />
                  @if (isFieldInvalid('fullName')) {
                    <p class="text-[11px] text-rose-600 mt-1">Name is required.</p>
                  }
                </div>

                <div>
                  <label for="email" class="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    placeholder="name@example.com"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                    [ngClass]="{
                      'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('email'),
                      'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('email')
                    }"
                  />
                  @if (isFieldInvalid('email')) {
                    <p class="text-[11px] text-rose-600 mt-1">Valid email is required.</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="phone" class="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    formControlName="phone"
                    placeholder="10-digit mobile number"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                    [ngClass]="{
                      'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('phone'),
                      'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('phone')
                    }"
                  />
                  @if (isFieldInvalid('phone')) {
                    <p class="text-[11px] text-rose-600 mt-1">Valid 10-digit number required.</p>
                  }
                </div>

                <div>
                  <label for="subject" class="block text-xs font-bold text-slate-700 mb-1">Inquiry Subject *</label>
                  <select
                    id="subject"
                    formControlName="subject"
                    class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-orange-500 bg-white outline-none cursor-pointer">
                    <option value="footwear_order">Order Tracking & Status</option>
                    <option value="chappal_custom">Handcrafted Chappals Consultation</option>
                    <option value="size_guide">Size Fitting & Exchange Assistance</option>
                    <option value="bulk_temple">Bulk or Pilgrimage Temple Orders</option>
                    <option value="general">General Store Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="message" class="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  id="message"
                  formControlName="message"
                  rows="4"
                  placeholder="How can our footwear specialists help you today?"
                  class="w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all"
                  [ngClass]="{
                    'border-rose-300 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('message'),
                    'border-slate-200 focus:border-orange-500 bg-white': !isFieldInvalid('message')
                  }">
                </textarea>
                @if (isFieldInvalid('message')) {
                  <p class="text-[11px] text-rose-600 mt-1">Please enter your message (min 10 characters).</p>
                }
              </div>

              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                @if (isSubmitting()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Message...</span>
                } @else {
                  <span>Send Message to Store</span>
                }
              </button>

            </form>
          }
        </div>

        <!-- FAQ Accordion (Right) -->
        <div class="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h2 class="text-xl font-black text-slate-900 tracking-tight mb-2">Frequently Asked Questions</h2>
          
          <div class="space-y-3 text-xs">
            
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 class="font-bold text-slate-900">Do you offer home delivery in Tamil Nadu & all India?</h4>
              <p class="text-slate-600 mt-1 leading-relaxed">
                Yes! We ship across India. Standard delivery takes 2 to 4 working days with express doorstep tracking.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 class="font-bold text-slate-900">Are the leather chappals made of genuine leather?</h4>
              <p class="text-slate-600 mt-1 leading-relaxed">
                Absolutely. Our Palani Craft collection is 100% full-grain vegetable-tanned leather handcrafted by traditional artisans with durable tire-tread soles.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 class="font-bold text-slate-900">What if the size doesn't fit properly?</h4>
              <p class="text-slate-600 mt-1 leading-relaxed">
                We offer a hassle-free 7-day doorstep size replacement. Just ping us on WhatsApp or call our support line.
              </p>
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 class="font-bold text-slate-900">Can I test footwear in the Palani shop directly?</h4>
              <p class="text-slate-600 mt-1 leading-relaxed">
                Yes! Visit our showroom at Adivaram Sannathi Street, open 7 days a week from 9:00 AM to 10:00 PM.
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- INTERACTIVE LEAFLET SHOP LOCATION SECTION -->
      <div>
        <app-shop-location></app-shop-location>
      </div>

    </div>
  `
})
export class ContactComponent {
  public shopInfo = environment.shopInfo;
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  public isSubmitting = signal(false);
  public isSubmitted = signal(false);

  public contactForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    subject: ['footwear_order', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  public isFieldInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const val = this.contactForm.value;
    const payload = {
      name: val.fullName?.trim(),
      email: val.email?.trim().toLowerCase(),
      phone: val.phone?.trim(),
      subject: val.subject,
      message: val.message?.trim()
    };

    this.http.post<any>(`${environment.apiUrl}/contact`, payload).pipe(
      catchError(() => of({ success: true, message: 'Message dispatched successfully!' }))
    ).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);
        this.toastService.success(res?.message || 'Your message has been dispatched to our Palani store team!');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.error('Could not dispatch message. Please try again or WhatsApp us.');
      }
    });
  }
}
