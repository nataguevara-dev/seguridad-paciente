import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Event Activity Refresh — US1: Recent activity shows newly reported events (P1)', () => {
  const testEmail = `e2e-refresh-${Date.now()}@test.com`;
  const testPassword = 'Refresh123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('US1-SC1: New event appears on dashboard after submission', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Navigate to event report
    await page.goto('/event-report');
    await expect(page.locator('text=Reporte de Evento de Seguridad del Paciente')).toBeVisible({ timeout: 5000 });

    // Submit a complete patient safety event
    await page.fill('#patientFirstName', 'María');
    await page.fill('#patientLastName', 'López');
    await page.fill('#clinicalHistoryNumber', '112233');
    await page.selectOption('#documentType', 'Cédula de ciudadanía');
    await page.fill('#documentNumber', '9876543210');
    await page.fill('#birthDate', '1988-09-12');
    await page.selectOption('#service', 'Urgencias');
    await page.fill('#location', 'Hospital Central - Sala 5');
    await page.fill('#occurredAt', '2026-06-07T15:00');
    await page.fill('#description', 'Paciente presentó reacción alérgica a medicamento administrado. Se detuvo la administración y se notificó al médico.');

    await page.click('button[type="submit"]');

    // Wait for success message and redirect
    await expect(page.locator('text=Reporte enviado exitosamente')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Verify the new event appears in the recent activity section
    await expect(page.getByText('María López').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Urgencias - Hace').first()).toBeVisible();
  });

  test('US1-SC2: Events list loads and displays activity items', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Verify the events list is present with items
    const activityList = page.locator('ul[role="list"]');
    await expect(activityList).toBeVisible({ timeout: 5000 });
    const items = activityList.locator('li');
    await expect(items.first()).toBeVisible();
    await expect(items.first()).toContainText('María López');
  });
});
