import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ContactRequest, ContactResponse } from '../models/stepstyle.models';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly apiUrl = 'http://localhost:8080/api/contact';

  constructor(private http: HttpClient) {}

  public submitContactForm(request: ContactRequest): Observable<ApiResponse<ContactResponse>> {
    return this.http.post<ApiResponse<ContactResponse>>(this.apiUrl, request);
  }

  // Admin: Get all customer enquiries
  public getAllEnquiries(): Observable<ContactResponse[]> {
    return this.http.get<ContactResponse[]>(this.apiUrl);
  }

  // Admin: Mark enquiry as resolved
  public markResolved(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/resolve`, {});
  }
}
