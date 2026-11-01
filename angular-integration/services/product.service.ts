import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  ProductPageResponse,
  ProductRequestDto,
  ProductResponseDto,
} from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  public getAllProducts(
    page: number = 0,
    size: number = 12,
    sortBy: string = 'id',
    direction: string = 'asc'
  ): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<ProductPageResponse>(`${this.baseUrl}/products`, { params });
  }

  public getProductById(id: number): Observable<ProductResponseDto> {
    return this.http.get<ProductResponseDto>(`${this.baseUrl}/products/${id}`);
  }

  public searchProducts(keyword: string, page: number = 0, size: number = 12): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductPageResponse>(`${this.baseUrl}/products/search`, { params });
  }

  public getProductsByCategory(
    category: string,
    page: number = 0,
    size: number = 12
  ): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductPageResponse>(
      `${this.baseUrl}/products/category/${encodeURIComponent(category)}`,
      { params }
    );
  }

  public filterProducts(
    minPrice?: number,
    maxPrice?: number,
    size?: string,
    brand?: string,
    page: number = 0,
    sizeCount: number = 12
  ): Observable<ProductPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('sizeCount', sizeCount.toString());

    if (minPrice !== undefined && minPrice !== null) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      params = params.set('maxPrice', maxPrice.toString());
    }
    if (size) {
      params = params.set('size', size);
    }
    if (brand) {
      params = params.set('brand', brand);
    }

    return this.http.get<ProductPageResponse>(`${this.baseUrl}/products/filter`, { params });
  }

  public sortProducts(
    sortBy: string = 'price',
    direction: string = 'asc',
    page: number = 0,
    size: number = 12
  ): Observable<ProductPageResponse> {
    const params = new HttpParams()
      .set('sortBy', sortBy)
      .set('direction', direction)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductPageResponse>(`${this.baseUrl}/products/sort`, { params });
  }

  // Admin Endpoints
  public createProduct(request: ProductRequestDto): Observable<ProductResponseDto> {
    return this.http.post<ProductResponseDto>(`${this.baseUrl}/admin/products`, request);
  }

  public updateProduct(id: number, request: ProductRequestDto): Observable<ProductResponseDto> {
    return this.http.put<ProductResponseDto>(`${this.baseUrl}/admin/products/${id}`, request);
  }

  public deleteProduct(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/admin/products/${id}`);
  }

  public uploadProductImage(id: number, file: File): Observable<ProductResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ProductResponseDto>(
      `${this.baseUrl}/admin/products/${id}/image`,
      formData
    );
  }
}
