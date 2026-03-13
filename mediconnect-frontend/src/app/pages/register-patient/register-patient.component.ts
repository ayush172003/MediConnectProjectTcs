import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-patient',
  templateUrl: './register-patient.component.html',
  styleUrls: ['./register-patient.component.css']
})
export class RegisterPatientComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    // Pattern matches Backend regex exactly
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=_]).{8,}$/;
    
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.pattern(passwordPattern)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.authService.registerPatient(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/patient-dashboard']); // Auto-login handles redirect inside service
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && err.error.error) {
           this.errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'object') {
           // Handle global exception map for validation errors
           const errMap = Object.values(err.error).join(', ');
           this.errorMessage = errMap || 'Registration failed';
        } else {
           this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
