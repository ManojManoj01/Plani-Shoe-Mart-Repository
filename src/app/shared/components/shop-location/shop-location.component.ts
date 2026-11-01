import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shop-location',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <!-- Left: Shop Details & Directions -->
        <div class="lg:col-span-5 space-y-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
              <span class="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></span>
              Visit In-Store
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {{ shopInfo.name }}
            </h2>
            <p class="text-sm text-slate-500 mt-2 leading-relaxed">
              Experience authentic Palani handcrafted footwear, doctor-recommended orthopedic chappals, and international sports shoe brands in person at our flagship showroom.
            </p>
          </div>

          <!-- Info Cards -->
          <div class="space-y-4">
            
            <!-- Address -->
            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Store Address</h4>
                <p class="text-xs text-slate-600 mt-0.5 leading-snug">{{ shopInfo.address }}</p>
              </div>
            </div>

            <!-- Phone & Support -->
            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Phone & WhatsApp</h4>
                <p class="text-xs text-slate-600 mt-0.5">
                  <a [href]="'tel:' + shopInfo.phone" class="font-bold text-orange-600 hover:underline">{{ shopInfo.phone }}</a>
                  <span class="text-slate-400"> / {{ shopInfo.altPhone }}</span>
                </p>
              </div>
            </div>

            <!-- Timings -->
            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Opening Hours</h4>
                <p class="text-xs text-slate-600 mt-0.5 font-medium">{{ shopInfo.openingHours }}</p>
                <span class="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open Today
                </span>
              </div>
            </div>

          </div>

          <!-- Get Directions button -->
          <div class="pt-2">
            <a
              [href]="shopInfo.googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-neutral-900 hover:bg-orange-600 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all transform active:scale-95 group">
              <svg class="w-4 h-4 text-orange-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Get Directions in Google Maps</span>
              <svg class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Right: Interactive Leaflet OpenStreetMap -->
        <div class="lg:col-span-7">
          <div class="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
            <!-- Leaflet Container -->
            <div #mapContainer class="w-full h-full z-10"></div>

            <!-- Overlay badge on map -->
            <div class="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-xs flex items-center gap-2">
              <img src="assets/logo.jpg" alt="Palani Shoes" class="w-6 h-6 rounded-md object-contain" />
              <span class="font-bold text-slate-800">Palani Foothills Branch</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  `
})
export class ShopLocationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  public shopInfo = environment.shopInfo;
  private mapInstance: any = null;

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && this.mapContainer) {
      await this.initLeafletMap();
    }
  }

  private async initLeafletMap(): Promise<void> {
    try {
      // Dynamic import to prevent Node.js SSR runtime crashes
      const L = await import('leaflet');

      const lat = this.shopInfo.latitude;
      const lng = this.shopInfo.longitude;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      this.mapInstance = L.map(this.mapContainer.nativeElement, {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: false
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.mapInstance);

      // Custom marker with popup
      const marker = L.marker([lat, lng]).addTo(this.mapInstance);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-weight: 800; color: #ea580c; font-size: 14px;">${this.shopInfo.name}</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #475569;">${this.shopInfo.address}</p>
          <a href="${this.shopInfo.googleMapsUrl}" target="_blank" style="display: inline-block; background: #0f172a; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 11px; text-decoration: none; font-weight: bold;">Get Directions &rarr;</a>
        </div>
      `).openPopup();

    } catch (err) {
      console.warn('Could not load Leaflet interactive map:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  }
}
