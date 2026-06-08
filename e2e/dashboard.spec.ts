import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('User Story 3 — Base dashboard navigation (P3)', () => {
  const testEmail = `e2e-dash-${Date.now()}@test.com`;
  const testPassword = 'DashPass123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('US3-SC1: Dashboard shows after login with user info', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    await expect(page.locator('text=Entornos Seguros')).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('US3-SC2: Dashboard has navigation to event reporting', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    const reportLink = page.locator('text=Crear reporte');
    await expect(reportLink).toBeVisible();
    await reportLink.click();

    await expect(page).toHaveURL(/\/event-report/, { timeout: 5000 });
  });

  test('US3-SC3: Dashboard navigation cards are visible', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await expect(page.locator('text=Reportar Evento')).toBeVisible();
    await expect(page.locator('text=Ver Reportes')).toBeVisible();
    await expect(page.getByText('Estadísticas', { exact: true })).toBeVisible();
  });

  test('US3-SC4: Logout returns to login page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.click('text=Cerrar Sesión');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
  });
});
