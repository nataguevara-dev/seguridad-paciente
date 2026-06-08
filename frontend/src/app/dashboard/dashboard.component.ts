import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Shield, FileText, Users, BarChart3, Plus, LogOut } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { EventsService, SafetyEvent } from '../services/events.service';

interface User {
  id: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  readonly Shield = Shield;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly BarChart3 = BarChart3;
  readonly Plus = Plus;
  readonly LogOut = LogOut;

  currentUser: User | null = null;
  events: SafetyEvent[] = [];
  loadError: string | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadRecentEvents();
  }

  private loadCurrentUser() {
    this.currentUser = this.authService.getStoredUser();
  }

  private async loadRecentEvents() {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      this.events = await this.eventsService.getEvents(10);
    } catch {
      this.loadError = 'No se pudieron cargar los eventos recientes. Intenta de nuevo más tarde.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  relativeTime(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Hace menos de 1 minuto';
    if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
    if (diffHr < 24) return `Hace ${diffHr} hora${diffHr !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  truncate(text: string, max: number = 100): string {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  }

  navigateToEventReport() {
    this.router.navigate(['/event-report']);
  }

  navigateToEventHistory() {
    this.router.navigate(['/events']);
  }

  navigateToStatistics() {
    this.router.navigate(['/estadisticas']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}