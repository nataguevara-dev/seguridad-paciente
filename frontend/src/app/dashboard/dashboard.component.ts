import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Shield, FileText, Users, BarChart3, Plus } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  readonly Shield = Shield;
  readonly FileText = FileText;
  readonly Users = Users;
  readonly BarChart3 = BarChart3;
  readonly Plus = Plus;

  constructor(private router: Router) {}

  navigateToEventReport() {
    this.router.navigate(['/event-report']);
  }
}