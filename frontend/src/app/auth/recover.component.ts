import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, MailOpen, AlertTriangle, Check } from 'lucide-angular';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="p-3 bg-yellow-100 rounded-lg">
              <lucide-icon [img]="MailOpen" class="w-8 h-8 text-yellow-600"></lucide-icon>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p class="text-gray-600 text-sm mt-2">Te enviaremos instrucciones para restablecer tu contraseña</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="recoverError" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <lucide-icon [img]="AlertTriangle" class="w-5 h-5 text-red-600 mr-3"></lucide-icon>
            <p class="text-sm text-red-800">{{ recoverError }}</p>
          </div>
        </div>

        <!-- Success Alert -->
        <div *ngIf="recoverSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <lucide-icon [img]="Check" class="w-5 h-5 text-green-600 mr-3"></lucide-icon>
            <p class="text-sm text-green-800">Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.</p>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="recoverForm" (ngSubmit)="onSubmit()" class="space-y-6" *ngIf="!recoverSuccess">
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

          <button
            type="submit"
            [disabled]="isSubmitting"
            class="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200"
          >
            {{ isSubmitting ? 'Enviando...' : 'Enviar Instrucciones' }}
          </button>
        </form>

        <!-- Recovery Complete Section -->
        <div *ngIf="recoverSuccess" class="space-y-4">
          <p class="text-gray-700">
            Hemos enviado un correo a <strong>{{ recoverForm.get('email')?.value }}</strong> con instrucciones para restablecer tu contraseña.
          </p>
          <p class="text-sm text-gray-600">
            Si no recibes el correo en los próximos minutos, por favor revisa tu carpeta de spam.
          </p>
          <button
            (click)="navigateToLogin()"
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          >
            Volver a Iniciar Sesión
          </button>
        </div>

        <!-- Footer Links -->
        <div *ngIf="!recoverSuccess" class="mt-6 text-center text-sm space-y-2">
          <a (click)="navigateToLogin()" class="block text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
            Volver a iniciar sesión
          </a>
          <a (click)="navigateToRegister()" class="block text-gray-600 hover:text-gray-700 cursor-pointer">
            Crear una cuenta nueva
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
export class RecoverComponent {
  readonly MailOpen = MailOpen;
  readonly AlertTriangle = AlertTriangle;
  readonly Check = Check;

  recoverForm: FormGroup;
  isSubmitting = false;
  recoverError = '';
  recoverSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.recoverForm.valid) {
      this.isSubmitting = true;
      this.recoverError = '';
      this.performRecovery();
    }
  }

  private async performRecovery() {
    try {
      // Simulate sending recovery email
      // In a real implementation, this would call the backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.recoverSuccess = true;
      this.cdr.detectChanges();
    } catch (error) {
      this.recoverError = 'Error al enviar el correo de recuperación. Por favor intenta de nuevo.';
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recoverForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
