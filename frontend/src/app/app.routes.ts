import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'event-report',
    loadComponent: () => import('./event-report/event-report.component').then(m => m.EventReportComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];