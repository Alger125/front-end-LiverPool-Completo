import { expect, test } from '@playwright/test';

test('home shows the three reference modules and keeps demo tools hidden', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hola, Arturo' })).toBeVisible();
  await expect(page.locator('.home-module-card')).toHaveCount(3);
  await expect(page.getByText('Vista rápida por Rol')).toHaveCount(0);
  await page.getByRole('button', { name: /Arturo Ocampo/ }).click();
  await expect(page.getByText('Simular cambios sin guardar')).toHaveCount(0);
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('dialog')).toContainText('Confirmar cierre de sesión');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('create role preserves data across both reference steps and saves through the existing API', async ({
  page,
}) => {
  await page.goto('/roles/create');
  await page.getByLabel('Nombre del rol *', { exact: true }).fill('Gestor de prueba visual');
  await page
    .getByLabel('Descripción *', { exact: true })
    .fill('Administra grupos y secciones de la ubicación.');
  await page.getByLabel('Consultar grupos', { exact: true }).check();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Asignación de Roles', exact: true })
  ).toBeVisible();
  await page.getByLabel('Valor de condición 1').fill('Gerente de Tienda');
  await page.getByLabel('Valor de condición 2').fill('Liverpool Atizapán');
  await page.getByLabel('Valor de condición 3').fill('Liverpool');
  await expect(page.locator('.reference-role__rule')).toContainText('Gerente de Tienda');
  await page.getByRole('button', { name: 'Atrás', exact: true }).click();
  await expect(page.getByLabel('Nombre del rol *', { exact: true })).toHaveValue(
    'Gestor de prueba visual'
  );
  await expect(page.getByLabel('Consultar grupos', { exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page).toHaveURL('/roles');
  await expect(page.getByText('Rol creado exitosamente')).toBeVisible();
  await expect(page.getByText('Gestor de prueba visual', { exact: true })).toBeVisible();
});

test('organigram navigates into groups and retains the alternate table view', async ({ page }) => {
  await page.goto('/structures/operations');
  await expect(
    page.getByRole('button', { name: 'Departamento Línea Blanca', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Grupo 001', exact: true }).click();
  await page.getByRole('button', { name: 'Administrar grupos y secciones' }).click();
  await expect(page.getByRole('heading', { name: 'Editar Grupo', exact: true })).toBeVisible();
  await expect(page.locator('.gm-selected-sections')).toContainText('Refrigeración');
  await page.goto('/structures/corporate');
  await page.getByRole('button', { name: 'Hardline', exact: true }).click();
  await expect(page.locator('.structure-chart')).toContainText('Hardline');
  await page.getByRole('button', { name: 'Vista de tabla' }).click();
  await expect(page.getByRole('table')).toBeVisible();
});

test('group administration opens edit and confirmation states', async ({ page }) => {
  await page.goto('/structures/operations/departments/dep-perfumeria/groups');
  await expect(
    page.getByRole('heading', { name: 'Administración de Grupos', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Nuevo grupo', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Crear');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.getByRole('tab', { name: '1. Administrar Grupos y Secciones' }).click();
  await page.getByRole('button', { name: 'Eliminar Grupo 001', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Movimiento no permitido');
});

test('reports preview and export the selected columns', async ({ page }) => {
  await page.goto('/reports');
  await page.getByRole('button', { name: /Reportes por Rol/ }).click();
  await page.getByRole('button', { name: /Continuar a Selección de Datos/ }).click();
  await page.getByRole('button', { name: /Continuar a Vista Previa/ }).click();
  await expect(page.getByRole('table')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Descargar CSV/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  expect(await download.failure()).toBeNull();
});

test('history shows detail and empty states', async ({ page }) => {
  await page.goto('/history');
  await page.getByRole('button', { name: 'Ver Detalle', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Comparación de Valores');
  await page.getByRole('button', { name: 'Cerrar Detalle', exact: true }).click();
  await page.getByLabel('Buscar por Usuario o Detalle:').fill('sin-coincidencias-987654');
  await expect(page.getByText('No se encontraron registros de auditoría')).toBeVisible();
});

test('planning renders the two periods and an operational calendar', async ({ page }) => {
  await page.goto('/structures/planning');
  await expect(page.locator('.planning-period')).toHaveCount(2);
  await page.getByRole('tab', { name: /Calendario operativo/ }).click();
  await expect(page.locator('.planning-calendar__grid > div')).toHaveCount(31);
  await page.getByRole('button', { name: 'Planificación (Noviembre 2026)', exact: true }).click();
  await expect(page.locator('.planning-calendar__grid > div')).toHaveCount(30);
  await expect(page.getByText('Probar Concurrencia 409')).toHaveCount(0);
});

test('mobile screens fit the viewport and the navigation drawer works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    '/',
    '/roles',
    '/roles/create',
    '/structures/operations',
    '/structures/planning',
    '/reports',
    '/history',
    '/structures/corporate',
    '/structures/operations/departments/dep-linea-blanca/groups?groupId=group-001',
    '/access-management/exceptions',
    '/roles/3d377584-c0c5-4391-b4f9-b11ae93f4bfd/edit',
    '/search',
    '/login',
  ]) {
    await page.goto(route);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      route
    ).toBeTruthy();
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir o cerrar menú lateral' }).click();
  await page.getByRole('link', { name: 'Roles y permisos', exact: true }).click();
  await expect(page).toHaveURL('/roles');
  await expect(page.locator('.app-sidebar')).not.toHaveClass(/app-sidebar--open/);
});
