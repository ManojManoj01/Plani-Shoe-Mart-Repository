import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, OrderResponseDto } from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  public createOrder(request: CreateOrderRequest): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(this.apiUrl, request);
  }

  public getMyOrders(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/my-orders`);
  }

  public getOrderById(id: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.apiUrl}/${id}`);
  }
}
