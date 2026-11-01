import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  AddToCartRequest,
  CartResponseDto,
  UpdateCartItemRequest,
} from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = 'http://localhost:8080/api/cart';

  private cartSubject = new BehaviorSubject<CartResponseDto | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  public getCart(): Observable<CartResponseDto> {
    return this.http.get<CartResponseDto>(this.apiUrl).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  public addItem(request: AddToCartRequest): Observable<CartResponseDto> {
    return this.http.post<CartResponseDto>(`${this.apiUrl}/items`, request).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  public updateItem(itemId: number, request: UpdateCartItemRequest): Observable<CartResponseDto> {
    return this.http.put<CartResponseDto>(`${this.apiUrl}/items/${itemId}`, request).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  public removeItem(itemId: number): Observable<CartResponseDto> {
    return this.http.delete<CartResponseDto>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  public clearCart(): Observable<CartResponseDto> {
    return this.http.delete<CartResponseDto>(this.apiUrl).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }
}
