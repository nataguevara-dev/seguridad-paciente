import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { SafetyEvent } from '../services/events.service';

@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  imports: [NgIf, LucideAngularModule],
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.css']
})
export class EventDetailModalComponent {
  readonly X = X;

  @Input() event!: SafetyEvent;
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'failed': return 'Error';
      default: return 'Pendiente';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
