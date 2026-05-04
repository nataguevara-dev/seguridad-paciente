import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, AlertTriangle, Send, User, FileText, MapPin, Calendar } from 'lucide-angular';

interface PatientData {
  firstName: string;
  lastName: string;
  clinicalHistoryNumber: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
}

interface EventData {
  patient: PatientData;
  service: string;
  location: string;
  occurredAt: string;
  description: string;
}

@Component({
  selector: 'app-event-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './event-report.component.html',
  styleUrls: ['./event-report.component.css']
})
export class EventReportComponent {
  readonly AlertTriangle = AlertTriangle;
  readonly Send = Send;
  readonly User = User;
  readonly FileText = FileText;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;

  eventForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      // Patient information
      patientFirstName: ['', [Validators.required, Validators.minLength(2)]],
      patientLastName: ['', [Validators.required, Validators.minLength(2)]],
      clinicalHistoryNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      documentType: ['Cédula de ciudadanía', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      birthDate: ['', Validators.required],

      // Event information
      service: ['', Validators.required],
      location: ['', Validators.required],
      occurredAt: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';

      const formValue = this.eventForm.value;
      const eventData: EventData = {
        patient: {
          firstName: formValue.patientFirstName,
          lastName: formValue.patientLastName,
          clinicalHistoryNumber: formValue.clinicalHistoryNumber,
          documentType: formValue.documentType,
          documentNumber: formValue.documentNumber,
          birthDate: formValue.birthDate
        },
        service: formValue.service,
        location: formValue.location,
        occurredAt: formValue.occurredAt,
        description: formValue.description
      };

      // TODO: Call backend API
      this.submitEvent(eventData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private async submitEvent(eventData: EventData) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      console.log('Submitting event:', eventData);

      this.submitSuccess = true;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } catch (error) {
      this.submitError = 'Error al enviar el reporte. Por favor intente nuevamente.';
      console.error('Error submitting event:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.eventForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['minlength']) {
        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['pattern']) {
        return fieldName.includes('clinicalHistoryNumber') || fieldName.includes('documentNumber')
          ? 'Solo números permitidos'
          : 'Formato inválido';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.eventForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }
}