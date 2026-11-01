import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { Product, Category, FilterCriteria } from '../models/product.model';
import { environment } from '../../../environments/environment';

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'cat_men',
    name: "Men's Footwear",
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'Elevate your stride with athletic runners, formal oxfords, and versatile loafers.',
    itemCount: 48
  },
  {
    id: 'cat_women',
    name: "Women's Footwear",
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
    description: 'Graceful heels, cushioned flats, running trainers, and everyday comfort.',
    itemCount: 42
  },
  {
    id: 'cat_kids',
    name: "Kids' Collection",
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
    description: 'Playproof sneakers, school shoes, and soft flexible sandals for little explorers.',
    itemCount: 26
  },
  {
    id: 'cat_sports',
    name: 'Sports & Athletics',
    slug: 'sports',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
    description: 'High-performance marathons, gym trainers, cricket spikes, and court shoes.',
    itemCount: 35
  },
  {
    id: 'cat_formal',
    name: 'Formal Elegance',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
    description: 'Handcrafted genuine leather oxfords, derbies, and executive slip-ons.',
    itemCount: 22
  },
  {
    id: 'cat_casual',
    name: 'Casual & Lifestyle',
    slug: 'casual',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
    description: 'Trendsetting street sneakers, boat shoes, canvas, and relaxed loafers.',
    itemCount: 38
  },
  {
    id: 'cat_chappals',
    name: 'Chappals & Slippers',
    slug: 'chappals',
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic South Indian leather sandals, orthopaedic slippers, and daily slide comforts.',
    itemCount: 54
  }
];

export const SAMPLE_PRODUCTS: Product[] = [];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;

  private productsSignal = signal<Product[]>(SAMPLE_PRODUCTS);
  private categoriesSignal = signal<Category[]>(SAMPLE_CATEGORIES);

  public allProducts = this.productsSignal.asReadonly();
  public allCategories = this.categoriesSignal.asReadonly();

  private toProduct(dto: any): Product {
    const category = String(dto.category || 'chappals')
      .toLowerCase()
      .replace(/[^a-z]/g, '');

    const allowedCategories = [
      'men', 'women', 'kids', 'sports',
      'formal', 'casual', 'chappals'
    ];

    const imageUrl = dto.imageUrl
      ? (dto.imageUrl.startsWith('http')
          ? dto.imageUrl
          : `http://localhost:8080${dto.imageUrl.startsWith('/') ? '' : '/'}${dto.imageUrl}`)
      : 'https://placehold.co/600x600?text=Shoe';

    const price = Number(dto.price ?? 0);
    const originalPrice = Number(dto.originalPrice ?? price);

    return {
      id: String(dto.id),
      name: dto.name ?? '',
      brand: dto.brand ?? '',
      category: (allowedCategories.includes(category)
        ? category
        : 'chappals') as Product['category'],
      price,
      originalPrice,
      discountPercentage: Number(dto.discountPercentage ?? 0),
      description: dto.description ?? '',
      images: [imageUrl],
      sizes: (dto.availableSizes ?? [])
        .map((size: string | number) => Number(size))
        .filter((size: number) => Number.isFinite(size)),
      colors: (dto.availableColors ?? []).map((color: string) => ({
        name: color,
        hex: '#808080'
      })),
      rating: Number(dto.rating ?? 0),
      reviewCount: 0,
      inStock: Number(dto.stockQuantity ?? 0) > 0,
      stockCount: Number(dto.stockQuantity ?? 0),
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isSpecialOffer: Number(dto.discountPercentage ?? 0) > 0
    };
  }

  // Cached observable so multiple components share one request instead of firing duplicate requests
  private productsCache$: Observable<Product[]> | null = null;

  // Fetch products from Spring Boot (with automatic fallback to SAMPLE_PRODUCTS when backend is offline)
  public getProducts(forceRefresh = false): Observable<Product[]> {
    if (this.productsCache$ && !forceRefresh) {
      return this.productsCache$;
    }

    this.productsCache$ = this.http.get<any>(this.apiUrl, {
      params: { page: '0', size: '100' }
    }).pipe(
      map(response => {
        const items = response?.content ?? (Array.isArray(response) ? response : []);
        if (items.length === 0) {
          return SAMPLE_PRODUCTS;
        }
        return items.map((dto: any) => this.toProduct(dto));
      }),
      tap(products => this.productsSignal.set(products)),
      catchError(error => {
        this.productsCache$ = null;
        console.warn(
          'Could not reach Spring Boot backend at http://localhost:8080/api/products. Falling back to offline sample catalog.',
          error?.status === 0 ? 'Backend offline (ECONNREFUSED)' : `HTTP ${error?.status}: ${error?.message || error?.error?.message || 'Error'}`
        );
        this.productsSignal.set(SAMPLE_PRODUCTS);
        return of(SAMPLE_PRODUCTS);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.productsCache$;
  }

  public refreshProducts(): Observable<Product[]> {
    return this.getProducts(true);
  }

  // Fetch one product by its database ID (with fallback if backend is offline)
  public getProductById(id: string): Observable<Product | undefined> {
    return this.http.get<any>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    ).pipe(
      map(dto => this.toProduct(dto)),
      catchError(error => {
        const found = SAMPLE_PRODUCTS.find(p => p.id === id);
        return of(found);
      })
    );
  }

  public getFeaturedProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.slice(0, 8))
    );
  }

  public getNewArrivals(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.slice(0, 8))
    );
  }

  public getBestSellers(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => [...products].sort(
        (a, b) => b.rating - a.rating
      ).slice(0, 8))
    );
  }

  public getSpecialOffers(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(
        p => p.discountPercentage > 0
      ))
    );
  }

  public getRelatedProducts(
    currentId: string,
    category: string,
    limit = 4
  ): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => products.filter(
        p => p.id !== currentId &&
          p.category.toLowerCase() === category.toLowerCase()
      ).slice(0, limit))
    );
  }

  public getCategories(): Observable<Category[]> {
    return of(this.categoriesSignal());
  }

  public getBrands(): Observable<string[]> {
    return this.getProducts().pipe(
      map(products => [...new Set(products.map(p => p.brand))].sort())
    );
  }

  public filterProducts(
    criteria: FilterCriteria
  ): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => {
        let result = [...products];

        if (criteria.category && criteria.category !== 'all') {
          result = result.filter(p =>
            p.category.toLowerCase() ===
            criteria.category!.toLowerCase()
          );
        }

        if (criteria.searchQuery?.trim()) {
          const q = criteria.searchQuery.toLowerCase().trim();
          result = result.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }

        if (criteria.minPrice != null) {
          result = result.filter(p => p.price >= criteria.minPrice!);
        }

        if (criteria.maxPrice != null) {
          result = result.filter(p => p.price <= criteria.maxPrice!);
        }

        if (criteria.sizes?.length) {
          result = result.filter(p =>
            p.sizes.some(s => criteria.sizes!.includes(s))
          );
        }

        if (criteria.brands?.length) {
          result = result.filter(p =>
            criteria.brands!.includes(p.brand)
          );
        }

        if (criteria.inStockOnly) {
          result = result.filter(p => p.inStock);
        }

        switch (criteria.sortBy) {
          case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
          case 'discount':
            result.sort(
              (a, b) => b.discountPercentage - a.discountPercentage
            );
            break;
          case 'newest':
            result.sort((a, b) => Number(b.id) - Number(a.id));
            break;
          default:
            result.sort((a, b) => b.rating - a.rating);
        }

        return result;
      })
    );
  }
}
