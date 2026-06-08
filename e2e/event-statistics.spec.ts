import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Event Statistics — US1: Visualizar panel de estadísticas (P1)', () => {
  const testEmail = `e2e-stats-${Date.now()}@test.com`;
  const testPassword = 'Stats123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  async function loginAndGetToken(page: any): Promise<string> {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    return page.evaluate(() => localStorage.getItem('token'));
  }

  async function createEventViaApi(request: any, token: string, service: string) {
    const patient = {
      firstName: `Test${Date.now()}`,
      lastName: `Patient${Math.random().toString(36).slice(2, 6)}`,
      clinicalHistoryNumber: String(Date.now()).slice(-6),
      documentType: 'Cédula de ciudadanía',
      documentNumber: String(Date.now()).slice(-10),
      birthDate: '1990-01-15'
    };

    await request.post(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        patient,
        service,
        location: 'Hospital Central',
        occurredAt: new Date().toISOString(),
        description: `Evento de prueba para estadísticas en ${service}`
      }
    });
  }

  test('US1-SC1: Statistics page loads with 4 chart headings', async ({ page, request }) => {
    const token = await loginAndGetToken(page);

    await createEventViaApi(request, token, 'Urgencias');
    await createEventViaApi(request, token, 'Medicina Interna');
    await createEventViaApi(request, token, 'Pediatría');

    await page.goto('/estadisticas');
    await page.waitForTimeout(1500);

    await expect(page.getByText('Estadísticas de Eventos')).toBeVisible();
    await expect(page.getByText('Distribución por Servicio')).toBeVisible();
    await expect(page.getByText('Histograma Mensual')).toBeVisible();
    await expect(page.getByText('Distribución por Hora')).toBeVisible();
    await expect(page.getByText('Top 10 Pacientes')).toBeVisible();
  });

  test('US1-SC2: Charts display canvas elements when data exists', async ({ page, request }) => {
    const token = await loginAndGetToken(page);

    await createEventViaApi(request, token, 'Urgencias');
    await createEventViaApi(request, token, 'Cirugía General');

    await page.goto('/estadisticas');
    await page.waitForTimeout(1500);

    const canvases = page.locator('canvas');
    await expect(canvases.first()).toBeVisible();
    const count = await canvases.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('US1-SC3: Empty state shows when filter yields no results', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/estadisticas');
    await page.waitForTimeout(1000);

    await page.locator('input[type="date"]').first().fill('2020-01-01');
    await page.locator('input[type="date"]').last().fill('2020-01-31');
    await page.getByText('Aplicar').click();
    await page.waitForTimeout(1500);

    const noDataMessages = page.locator('text=No hay datos disponibles');
    await expect(noDataMessages.first()).toBeVisible();
  });
});

test.describe('Event Statistics — US2: Filtrar estadísticas por rango de fechas (P2)', () => {
  const testEmail = `e2e-stats-filters-${Date.now()}@test.com`;
  const testPassword = 'Filter123';

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_URL}/auth/register`, {
      data: { email: testEmail, password: testPassword, role: 'reporter' }
    });
  });

  test('US2-SC1: Date filter applies and charts update', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/estadisticas');
    await page.waitForTimeout(1000);

    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 1);

    const fromStr = pastDate.toISOString().split('T')[0];
    const toStr = today.toISOString().split('T')[0];

    await page.locator('input[type="date"]').first().fill(fromStr);
    await page.locator('input[type="date"]').last().fill(toStr);
    await page.getByText('Aplicar').click();
    await page.waitForTimeout(1500);

    await expect(page.getByText('Estadísticas de Eventos')).toBeVisible();
  });

  test('US2-SC2: Clear filters button resets date inputs', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/estadisticas');
    await page.waitForTimeout(1000);

    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 7);

    await page.locator('input[type="date"]').first().fill(pastDate.toISOString().split('T')[0]);
    await page.locator('input[type="date"]').last().fill(today.toISOString().split('T')[0]);
    await page.getByText('Limpiar filtros').click();
    await page.waitForTimeout(1500);

    const fromInput = page.locator('input[type="date"]').first();
    const toInput = page.locator('input[type="date"]').last();
    await expect(fromInput).toHaveValue('');
    await expect(toInput).toHaveValue('');
  });

  test('US2-SC3: Invalid date range shows validation error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    await page.goto('/estadisticas');
    await page.waitForTimeout(1000);

    await page.locator('input[type="date"]').first().fill('2026-06-30');
    await page.locator('input[type="date"]').last().fill('2026-01-01');
    await page.getByText('Aplicar').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('La fecha "desde" no puede ser posterior a la fecha "hasta"')).toBeVisible();
  });
});
