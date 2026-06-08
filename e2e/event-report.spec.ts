import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('User Story 1 — Report patient safety event (P1)', () => {
  const testEmail = `e2e-event-${Date.now()}@test.com`;
  const testPassword = 'EventPass123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('US1-SC1: Submit a complete patient safety event', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/event-report');
    await expect(page.locator('text=Reporte de Evento de Seguridad del Paciente')).toBeVisible({ timeout: 5000 });

    await page.fill('#patientFirstName', 'Ana');
    await page.fill('#patientLastName', 'Pérez');
    await page.fill('#clinicalHistoryNumber', '98765');
    await page.selectOption('#documentType', 'Cédula de ciudadanía');
    await page.fill('#documentNumber', '1234567890');
    await page.fill('#birthDate', '1990-05-15');
    await page.selectOption('#service', 'Urgencias');
    await page.fill('#location', 'Hospital Central - Sala 3');
    await page.fill('#occurredAt', '2026-06-07T14:30');
    await page.fill('#description', 'Paciente sufrió una caída desde la camilla al intentar levantarse sin asistencia. Se activó protocolo de caídas.');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Reporte enviado exitosamente')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('US1-SC2: Create event via API and verify storage', async ({ request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: testEmail, password: testPassword }
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const eventRes = await request.post(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        patient: {
          firstName: 'Carlos',
          lastName: 'Gómez',
          clinicalHistoryNumber: '54321',
          documentType: 'Cédula de ciudadanía',
          documentNumber: '9876543210',
          birthDate: '1985-03-20'
        },
        service: 'Medicina Interna',
        location: 'Piso 3 - Habitación 310',
        occurredAt: '2026-06-07T10:00:00Z',
        description: 'Error de medicación: paciente recibió dosis incorrecta de insulina. Se notificó al médico tratante.'
      }
    });

    expect(eventRes.ok()).toBeTruthy();
    const eventData = await eventRes.json();
    expect(eventData.success).toBeTruthy();
    expect(eventData.data.event).toBeDefined();
    expect(eventData.data.event.service).toBe('Medicina Interna');

    const listRes = await request.get(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const listData = await listRes.json();
    expect(listData.data.events.length).toBeGreaterThanOrEqual(1);
  });
});
