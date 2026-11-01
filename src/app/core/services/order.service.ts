import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private http = inject(HttpClient);
  private ordersApiUrl = `${environment.apiUrl}/orders`;

  public getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ordersApiUrl);
  }

  public getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.ordersApiUrl}/${id}`);
  }
}
