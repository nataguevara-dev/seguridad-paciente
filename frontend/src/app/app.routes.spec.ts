import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';

describe('App Routes', () => {
  it('should have auth routes with login, register, recover', () => {
    const authRoute = routes.find(r => r.path === 'auth');
    expect(authRoute).toBeDefined();
    expect(authRoute!.children).toHaveLength(4);
    expect(authRoute!.children!.map(c => c.path)).toContain('login');
    expect(authRoute!.children!.map(c => c.path)).toContain('register');
    expect(authRoute!.children!.map(c => c.path)).toContain('recover');
  });

  it('should have auth children as lazy loaded components', () => {
    const authRoute = routes.find(r => r.path === 'auth');
    expect(typeof authRoute!.children![0].loadComponent).toBe('function');
  });

  it('should have dashboard route with canActivate guard', () => {
    const dashboardRoute = routes.find(r => r.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute!.canActivate).toBeDefined();
    expect(dashboardRoute!.canActivate).toHaveLength(1);
  });

  it('should have events, event-report, estadisticas routes', () => {
    const paths = routes.map(r => r.path);
    expect(paths).toContain('events');
    expect(paths).toContain('event-report');
    expect(paths).toContain('estadisticas');
  });

  it('should redirect empty path to dashboard', () => {
    const redirectRoute = routes.find(r => r.path === '');
    expect(redirectRoute).toBeDefined();
    expect(redirectRoute!.redirectTo).toBe('/dashboard');
    expect(redirectRoute!.pathMatch).toBe('full');
  });

  it('should have wildcard redirect to dashboard', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute!.redirectTo).toBe('/dashboard');
  });

  it('should have auth empty path redirect to login', () => {
    const authRoute = routes.find(r => r.path === 'auth');
    const emptyChild = authRoute!.children!.find(c => c.path === '');
    expect(emptyChild).toBeDefined();
    expect(emptyChild!.redirectTo).toBe('login');
    expect(emptyChild!.pathMatch).toBe('full');
  });
});
