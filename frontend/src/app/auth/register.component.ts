import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LucideAngularModule, UserPlus, Mail, Lock, AlertTriangle, Check } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="p-3 bg-green-100 rounded-lg">
              <lucide-icon [img]="UserPlus" class="w-8 h-8 text-green-600"></lucide-icon>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p class="text-gray-600 text-sm mt-2">Regístrate para reportar eventos de seguridad del paciente</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="registerError" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <lucide-icon [img]="AlertTriangle" class="w-5 h-5 text-red-600 mr-3"></lucide-icon>
            <p class="text-sm text-red-800">{{ registerError }}</p>
          </div>
        </div>

        <!-- Success Alert -->
        <div *ngIf="registerSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <lucide-icon [img]="Check" class="w-5 h-5 text-green-600 mr-3"></lucide-icon>
            <p class="text-sm text-green-800">Cuenta creada exitosamente. Redirigiendo...</p>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
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
              placeholder="Mínimo 6 caracteres"
              [class.border-red-300]="isFieldInvalid('password')"
            />
            <p *ngIf="isFieldInvalid('password')" class="text-red-600 text-sm mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="role"
              formControlName="role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Selecciona tu rol</option>
              <option value="reporter">Reportero</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
            <p *ngIf="isFieldInvalid('role')" class="text-red-600 text-sm mt-1">
              Por favor selecciona un rol
            </p>
          </div>

          <button
            type="submit"
            [disabled]="isSubmitting"
            class="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200"
          >
            {{ isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 text-center text-sm">
          <a (click)="navigateToLogin()" class="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </a>
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
export class RegisterComponent {
  readonly UserPlus = UserPlus;
  readonly AlertTriangle = AlertTriangle;
  readonly Check = Check;

  registerForm: FormGroup;
  isSubmitting = false;
  registerError = '';
  registerSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.registerError = '';
      this.performRegister();
    }
  }

  private async performRegister() {
    const { email, password, role } = this.registerForm.value;
    const result = await this.authService.register(email, password, role);

    if (result.success) {
      this.registerSuccess = true;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      this.registerError = result.message || 'Error al crear la cuenta. Por favor intenta de nuevo.';
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
