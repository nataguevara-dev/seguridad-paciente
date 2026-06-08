import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Event History — US1: Consultar historial con filtros (P1)', () => {
  const testEmail = `e2e-history-${Date.now()}@test.com`;
  const testPassword = 'History123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  async function createEvent(page: any, firstName: string, lastName: string, service: string) {
    await page.goto('/event-report');
    await expect(page.locator('text=Reporte de Evento de Seguridad del Paciente')).toBeVisible({ timeout: 5000 });

    await page.fill('#patientFirstName', firstName);
    await page.fill('#patientLastName', lastName);
    await page.fill('#clinicalHistoryNumber', String(Date.now()).slice(-6));
    await page.selectOption('#documentType', 'Cédula de ciudadanía');
    await page.fill('#documentNumber', String(Date.now()).slice(-10));
    await page.fill('#birthDate', '1990-01-15');
    await page.selectOption('#service', service);
    await page.fill('#location', 'Hospital Central');
    await page.fill('#occurredAt', new Date().toISOString().slice(0, 16));
    await page.fill('#description', `Evento de prueba para ${firstName} ${lastName}`);

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Reporte enviado exitosamente')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test('US1-SC1: History page loads with table and shows events', async ({ page }) => {
    await createEvent(page, 'Juan', 'Pérez', 'Urgencias');
    await createEvent(page, 'María', 'López', 'Medicina Interna');

    await page.goto('/events');
    await page.waitForTimeout(1000);

    await expect(page.getByText('Historial de Eventos')).toBeVisible();
    const headers = page.locator('table thead th');
    await expect(headers.nth(0)).toHaveText('Paciente');
    await expect(headers.nth(1)).toHaveText('Servicio');
    await expect(headers.nth(2)).toHaveText('Descripción');
    await expect(headers.nth(3)).toHaveText('Fecha');
    await expect(headers.nth(4)).toHaveText('Estado');

    await expect(page.getByText('Juan Pérez').first()).toBeVisible();
    await expect(page.getByText('María López').first()).toBeVisible();
  });

  test('US1-SC2: Apply service filter filters table', async ({ page }) => {
    await createEvent(page, 'Ana', 'García', 'Urgencias');
    await createEvent(page, 'Carlos', 'Ruiz', 'Pediatría');

    await page.goto('/events');
    await page.waitForTimeout(1000);

    await page.getByLabel('Servicio').selectOption('Urgencias');
    await page.waitForTimeout(500);

    await expect(page.getByText('Ana García').first()).toBeVisible();
    await expect(page.getByText('Carlos Ruiz')).not.toBeVisible();
  });

  test('US1-SC3: Month/year filter works', async ({ page }) => {
    await createEvent(page, 'Laura', 'Torres', 'Cirugía');

    await page.goto('/events');
    await page.waitForTimeout(1000);

    const now = new Date();
    const currentYear = now.getFullYear();

    await page.getByLabel('Año').selectOption(String(currentYear));
    await page.waitForTimeout(500);

    await expect(page.getByText('Laura Torres').first()).toBeVisible();

    await page.getByLabel('Año').selectOption(String(currentYear - 5));
    await page.waitForTimeout(500);

    await expect(page.getByText('No se encontraron eventos')).toBeVisible();
  });

  test('US1-SC4: No results state when filter yields no matches', async ({ page }) => {
    await page.goto('/events');
    await page.waitForTimeout(1000);

    await page.getByLabel('Servicio').selectOption('Ginecología');
    await page.waitForTimeout(500);

    await expect(page.getByText('No se encontraron eventos')).toBeVisible();
    await expect(page.getByText('Limpiar filtros').first()).toBeVisible();
  });

  test('US1-SC5: Clear filters button resets filters', async ({ page }) => {
    await createEvent(page, 'Pedro', 'Sánchez', 'Urgencias');

    await page.goto('/events');
    await page.waitForTimeout(1000);

    await page.getByLabel('Servicio').selectOption('Ginecología');
    await page.waitForTimeout(500);
    await expect(page.getByText('No se encontraron eventos')).toBeVisible();

    await page.getByText('Limpiar filtros').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Pedro Sánchez').first()).toBeVisible();
  });
});

test.describe('Event History — US2: Ver detalle completo en modal (P2)', () => {
  const testEmail = `e2e-modal-${Date.now()}@test.com`;
  const testPassword = 'Modal123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  async function createModalEvent(page: any) {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/event-report');
    await expect(page.locator('text=Reporte de Evento de Seguridad del Paciente')).toBeVisible({ timeout: 5000 });

    await page.fill('#patientFirstName', 'Modal');
    await page.fill('#patientLastName', 'TestUser');
    await page.fill('#clinicalHistoryNumber', '999999');
    await page.selectOption('#documentType', 'Cédula de ciudadanía');
    await page.fill('#documentNumber', '1234567890');
    await page.fill('#birthDate', '1985-05-20');
    await page.selectOption('#service', 'Urgencias');
    await page.fill('#location', 'Sala de Urgencias - Cama 12');
    await page.fill('#occurredAt', '2026-06-07T14:30');
    await page.fill('#description', 'Paciente presenta dolor torácico agudo con dificultad respiratoria.');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Reporte enviado exitosamente')).toBeVisible({ timeout: 10000 });
  }

  test('US2-SC1: Click row opens modal with event details', async ({ page }) => {
    await createModalEvent(page);

    await page.goto('/events');
    await page.waitForTimeout(1000);

    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Detalle del Evento')).toBeVisible();
    await expect(page.getByText('Información del Paciente')).toBeVisible();
    await expect(page.getByText('Modal TestUser').first()).toBeVisible();
    await expect(page.getByText('Información del Evento')).toBeVisible();
    await expect(page.getByText('Sala de Urgencias - Cama 12')).toBeVisible();

    await page.locator('app-event-detail-modal button').first().click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Detalle del Evento')).not.toBeVisible();
  });

  test('US2-SC2: Modal closes on backdrop click', async ({ page }) => {
    await createModalEvent(page);

    await page.goto('/events');
    await page.waitForTimeout(1000);

    await page.locator('table tbody tr').first().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Detalle del Evento')).toBeVisible();

    await page.locator('.fixed.inset-0.z-50').first().click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    await expect(page.getByText('Detalle del Evento')).not.toBeVisible();
  });
});
