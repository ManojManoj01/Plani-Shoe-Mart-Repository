import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Tests connection to the backend API endpoint (/api/test)
   * Returns response as plain text.
   */
  public testConnection(): Observable<string> {
    return this.http.get(`${this.apiUrl}/test`, {
      responseType: 'text'
    });
  }
}
