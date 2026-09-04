import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

  constructor() { }

  /**
   * Mocks a call to the submit registration API.
   * This will eventually be replaced with an HTTP POST to the Python Azure Function.
   */
  submitRegistration(request: RegistrationRequest): Observable<RegistrationResponse> {
    console.log('Mock API call: Submitting registration for', request);
    
    // Simulate network delay and successful response
    return of({
      success: true,
      message: 'Please check your email to verify your registration and provision your tenant.'
    }).pipe(delay(1500));
  }
}
