import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'recover',
        loadComponent: () => import('./auth/recover.component').then(m => m.RecoverComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'events',
    canActivate: [AuthGuard],
    loadComponent: () => import('./event-history/event-history.component').then(m => m.EventHistoryComponent)
  },
  {
    path: 'event-report',
    canActivate: [AuthGuard],
    loadComponent: () => import('./event-report/event-report.component').then(m => m.EventReportComponent)
  },
  {
    path: 'estadisticas',
    canActivate: [AuthGuard],
    loadComponent: () => import('./event-statistics/event-statistics.component').then(m => m.EventStatisticsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];