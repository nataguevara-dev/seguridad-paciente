import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LucideAngularModule, LogIn, Mail, Lock, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <lucide-icon [img]="LogIn" class="w-8 h-8 text-blue-600"></lucide-icon>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p class="text-gray-600 text-sm mt-2">Accede a tu cuenta para reportar eventos de seguridad</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="loginError" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <lucide-icon [img]="AlertTriangle" class="w-5 h-5 text-red-600 mr-3"></lucide-icon>
            <p class="text-sm text-red-800">{{ loginError }}</p>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="tu@correo.com"
              [class.border-red-300]="isFieldInvalid('email')"
            />
            <p *ngIf="isFieldInvalid('email')" class="text-red-600 text-sm mt-1">
              Por favor ingresa un correo válido
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              [class.border-red-300]="isFieldInvalid('password')"
            />
            <p *ngIf="isFieldInvalid('password')" class="text-red-600 text-sm mt-1">
              La contraseña es obligatoria
            </p>
          </div>

          <button
            type="submit"
            [disabled]="isSubmitting"
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200"
          >
            {{ isSubmitting ? 'Conectando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 space-y-3 text-center text-sm">
          <div>
            <a (click)="navigateToRegister()" class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              ¿No tienes cuenta? Regístrate aquí
            </a>
          </div>
          <div>
            <a (click)="navigateToRecover()" class="text-gray-600 hover:text-gray-700 cursor-pointer">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  readonly LogIn = LogIn;
  readonly AlertTriangle = AlertTriangle;

  loginForm: FormGroup;
  isSubmitting = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.loginError = '';
      this.performLogin();
    }
  }

  private async performLogin() {
    const { email, password } = this.loginForm.value;
    const result = await this.authService.login(email, password);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.loginError = result.message || 'Error al iniciar sesión. Por favor intenta de nuevo.';
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  navigateToRecover() {
    this.router.navigate(['/auth/recover']);
  }
}
