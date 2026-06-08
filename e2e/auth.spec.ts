import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('User Story 2 — Account access and recovery (P2)', () => {
  const testEmail = `e2e-auth-${Date.now()}@test.com`;
  const testPassword = 'TestPass123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('US2-SC1: Register a new account', async ({ page }) => {
    const email = `e2e-register-${Date.now()}@test.com`;
    await page.goto('/auth/register');

    await page.fill('#email', email);
    await page.fill('#password', 'NewPass456');
    await page.selectOption('#role', 'reporter');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test('US2-SC2: Sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    await expect(page.locator('text=Entornos Seguros')).toBeVisible();
  });

  test('US2-SC3: Show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', 'wrong@test.com');
    await page.fill('#password', 'WrongPass123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('US2-SC4: Password recovery page loads and submits', async ({ page }) => {
    await page.goto('/auth/recover');
    await expect(page.locator('text=Recuperar Contraseña')).toBeVisible();

    await page.fill('#email', testEmail);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Correo de recuperación')).toBeVisible({ timeout: 5000 });
  });

  test('US2-SC5: Navigate between auth pages', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Regístrate aquí');
    await expect(page).toHaveURL(/\/auth\/register/);

    await page.click('text=Inicia sesión aquí');
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.click('text=Olvidaste tu contraseña');
    await expect(page).toHaveURL(/\/auth\/recover/);
  });
});
