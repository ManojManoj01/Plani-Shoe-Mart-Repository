import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {
  private http = inject(HttpClient);
  private categoriesApiUrl = `${environment.apiUrl}/categories`;

  public getCategories(all: boolean = true): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesApiUrl, {
      params: { all: String(all) }
    });
  }

  public createCategory(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.categoriesApiUrl, request);
  }

  public deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesApiUrl}/${id}`);
  }
}
