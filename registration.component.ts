import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from './registration.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);

  registrationForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    company: ['', Validators.required],
    address: ['', Validators.required]
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    this.registrationService.submitRegistration(this.registrationForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          this.registrationForm.reset();
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('Submission error', err);
        this.isLoading = false;
        this.errorMessage = 'An error occurred during submission. Please try again later.';
      }
    });
  }
}
