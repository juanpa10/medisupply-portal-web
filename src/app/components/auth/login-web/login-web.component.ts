import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-web',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-lg shadow p-6">
        <div class="text-center mb-4">
          <img src="/assets/logo.png" alt="Logo" class="h-10 mx-auto" />
          <h2 class="mt-3 text-2xl font-semibold">Welcome back</h2>
          <p class="text-sm text-gray-500">Sign in to continue to MeddiSupply</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input formControlName="email" type="email" class="mt-1 block w-full border rounded p-2" placeholder="you@example.com" />
            <div *ngIf="form.controls.email.invalid && form.controls.email.touched" class="text-red-600 text-sm">Please enter a valid email</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input formControlName="password" type="password" class="mt-1 block w-full border rounded p-2" placeholder="••••••••" />
            <div *ngIf="form.controls.password.invalid && form.controls.password.touched" class="text-red-600 text-sm">Password is required</div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input type="checkbox" id="remember" class="mr-2" />
              <label for="remember" class="text-sm text-gray-600">Remember me</label>
            </div>
            <a class="text-sm text-blue-600" href="#">Forgot?</a>
          </div>

          <div>
            <button type="submit" [disabled]="form.invalid" class="w-full bg-blue-600 text-white py-2 rounded">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginWebComponent {
  form = this.createForm();

  constructor(private fb: FormBuilder, private router: Router) {}

  private createForm() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      // For this no-backend demo, just navigate to the app area
      this.router.navigate(['/app']);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
