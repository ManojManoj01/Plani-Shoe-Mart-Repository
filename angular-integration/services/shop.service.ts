import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShopLocationDto } from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly apiUrl = 'http://localhost:8080/api/shop';

  constructor(private http: HttpClient) {}

  public getShopLocation(): Observable<ShopLocationDto> {
    return this.http.get<ShopLocationDto>(`${this.apiUrl}/location`);
  }
}
