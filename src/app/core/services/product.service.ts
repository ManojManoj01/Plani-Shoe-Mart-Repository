import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductRequest,
  ProductPageResponse,
  DashboardStats,
  ImageUploadResponse
} from '../models/product.model';

export interface AdminProductFilterParams {
  category?: string;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private http = inject(HttpClient);
  private productsApiUrl = `${environment.apiUrl}/products`;
  private adminApiUrl = `${environment.apiUrl}/admin`;

  public getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.adminApiUrl}/stats`);
  }

  public getAdminProducts(params: AdminProductFilterParams): Observable<ProductPageResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 15))
      .set('sortBy', params.sortBy ?? 'id')
      .set('direction', params.direction ?? 'desc');

    if (params.category && params.category !== 'all') {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.active !== undefined && params.active !== null) {
      httpParams = httpParams.set('active', String(params.active));
    }
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return this.http.get<ProductPageResponse>(`${this.adminApiUrl}/products`, { params: httpParams });
  }

  public getProductById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.productsApiUrl}/${id}`);
  }

  public createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.productsApiUrl, request);
  }

  public updateProduct(id: number | string, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.productsApiUrl}/${id}`, request);
  }

  public deleteProduct(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.productsApiUrl}/${id}`);
  }

  public toggleStatus(id: number | string, active: boolean): Observable<Product> {
    return this.http.patch<Product>(`${this.productsApiUrl}/${id}/status`, { active });
  }

  public uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.productsApiUrl}/upload-image`, formData);
  }

  public uploadProductImage(id: number | string, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.productsApiUrl}/${id}/image`, formData);
  }

  public formatImageUrl(url?: string | null): string {
    if (!url || !url.trim()) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
    }
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `http://localhost:8080${cleanPath}`;
  }
}
