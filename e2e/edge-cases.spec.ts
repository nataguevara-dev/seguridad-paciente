import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Edge cases & validation', () => {
  const testEmail = `e2e-edge-${Date.now()}@test.com`;
  const testPassword = 'EdgePass123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('EC1: Submit event form with missing fields shows validation', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/event-report');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=obligatorio').first()).toBeVisible({ timeout: 3000 });
  });

  test('EC2: Duplicate email registration shows error', async ({ page }) => {
    const dupEmail = `e2e-dup-${Date.now()}@test.com`;

    const res1 = await page.request.post(`${API_URL}/auth/register`, {
      data: { email: dupEmail, password: 'Pass1234', role: 'reporter' }
    });
    expect(res1.ok()).toBeTruthy();

    await page.goto('/auth/register');
    await page.fill('#email', dupEmail);
    await page.fill('#password', 'Pass1234');
    await page.selectOption('#role', 'reporter');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=User already exists with this email')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('EC3: Auth guard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 3000 });

    await page.goto('/event-report');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 3000 });
  });

  test('EC4: Recovery form submit succeeds even for unknown email', async ({ page }) => {
    await page.goto('/auth/recover');
    await page.fill('#email', 'nonexistent-' + Date.now() + '@test.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Correo de recuperación')).toBeVisible({ timeout: 5000 });
  });

  test('EC5: Logo and app title visible on login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.locator('text=Accede a tu cuenta')).toBeVisible();
  });
});
