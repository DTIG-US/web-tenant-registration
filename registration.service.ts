import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface RegistrationRequest {
  name: string;
  email: string;
  company: string;
  address: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private http = inject(HttpClient);

  constructor() { }

  /**
   * Calls the SubmitRegistration API.
   */
  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post('/api/SubmitRegistration', request, { responseType: 'text' }).pipe(
      map(responseMessage => ({
        success: true,
        message: responseMessage
      })),
      catchError((error: HttpErrorResponse) => {
        console.error('Registration failed:', error);
        return of({
          success: false,
          message: error.error || 'An unexpected error occurred.'
        });
      })
    );
  }
}
