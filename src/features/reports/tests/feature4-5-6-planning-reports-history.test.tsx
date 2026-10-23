import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import FuturePlanningPage from '../../gestion-estructuras/pages/FuturePlanningPage';
import { HistoryPage } from '../../history/pages/HistoryPage';
import { InitialLoadsPage } from '../../initial-loads/pages/InitialLoadsPage';
import { ReportsHubPage } from '../pages/ReportsHubPage';

describe('Features 4, 5 y 6 — Planeación Futura, Reportes, Historial y Cargas Iniciales', () => {
  it('Feature 4: FuturePlanningPage permite alternar periodos, ver diffs, simular bloqueo y concurrencia 409', () => {
    render(
      <MemoryRouter initialEntries={['/structures/planning']}>
        <Routes>
          <Route path="/structures/planning" element={<FuturePlanningPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Planeación Futura y Publicaciones Estructurales/i)).toBeInTheDocument();

    // 1. Pestaña 1: Comparar estructura actual y futura
    expect(screen.getAllByText(/Sección 102 — Coctel y Evento Social/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Modificado/i).length).toBeGreaterThan(0);

    // 2. Conmutador de periodos
    const btnNov = screen.getByRole('button', { name: /Planificación \(Noviembre 2026\)/i });
    fireEvent.click(btnNov);
    expect(btnNov.className).toContain('fp-period-btn--active');

    // 3. Probar simulación de bloqueo de periodo (CU-ADM-007)
    const btnLock = screen.getByRole('button', { name: /Simular cierre de periodo/i });
    fireEvent.click(btnLock);
    expect(screen.getByText(/Edición deshabilitada: Periodo cerrado por cálculo de planes/i)).toBeInTheDocument();

    // 4. Probar detección de concurrencia 409 (CU-ADM-008)
    const btnConc = screen.getByRole('button', { name: /Probar Concurrencia 409/i });
    fireEvent.click(btnConc);
    const concDialog = screen.getByRole('dialog');
    expect(within(concDialog).getByText(/Información actualizada por otro usuario \(409\)/i)).toBeInTheDocument();
    fireEvent.click(within(concDialog).getByRole('button', { name: /Actualizar información/i }));
  });

  it('Feature 5: ReportsHubPage permite navegar a Reporte por Rol y completar su wizard de 3 pasos (CU-EST-002)', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <Routes>
          <Route path="/reports" element={<ReportsHubPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Consulta Módulo de Reportes/i)).toBeInTheDocument();

    // Iniciar Reporte por Rol
    fireEvent.click(screen.getByRole('button', { name: /Reportes por Rol/i }));

    // Paso 1: Filtros y Periodo
    expect(screen.getByText(/Paso 1: Configuración de Periodo y Filtros de Alcance/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continuar a Selección de Datos →/i }));

    // Paso 2: Selección de Datos
    expect(screen.getByText(/Paso 2: Selección de Columnas y Campos del Reporte/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continuar a Vista Previa/i }));

    // Paso 3: Vista Previa y Descarga
    expect(screen.getByText(/Paso 3: Vista Previa y Exportación del Reporte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar TXT/i })).toBeInTheDocument();
  });

  it('Feature 5: Reporte General valida fechas coherentes antes de pasar a la selección de columnas (CU-EST-003)', () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <Routes>
          <Route path="/reports" element={<ReportsHubPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Iniciar Reporte General
    fireEvent.click(screen.getByRole('button', { name: /Reportes General/i }));

    expect(screen.getByText(/Paso 1: Definición de Rango de Fechas/i)).toBeInTheDocument();

    // Ingresar fecha inicio posterior a fecha fin para probar validación
    const dateFromInput = screen.getByLabelText(/Fecha Inicio \*/i);
    const dateToInput = screen.getByLabelText(/Fecha Fin \*/i);
    fireEvent.change(dateFromInput, { target: { value: '2026-11-15' } });
    fireEvent.change(dateToInput, { target: { value: '2026-10-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Continuar a Selección de Columnas →/i }));

    expect(
      screen.getByText(/La Fecha de Inicio no puede ser posterior a la Fecha de Fin/i),
    ).toBeInTheDocument();
  });

  it('Feature 6: HistoryPage muestra eventos de auditoría, panel lateral de resumen y modal de detalle (CU-HIS-001)', () => {
    render(
      <MemoryRouter initialEntries={['/history']}>
        <Routes>
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Consulta del historial/i)).toBeInTheDocument();
    expect(screen.getByText(/Resumen de Auditoría/i)).toBeInTheDocument();

    // Abrir detalle del primer evento
    const detailButtons = screen.getAllByRole('button', { name: /Ver Detalle/i });
    expect(detailButtons.length).toBeGreaterThan(0);
    fireEvent.click(detailButtons[0]);

    const detailDialog = screen.getByRole('dialog');
    expect(within(detailDialog).getByText(/Comparación de Valores \(Antes vs Después\)/i)).toBeInTheDocument();
    fireEvent.click(within(detailDialog).getByRole('button', { name: /Cerrar Detalle/i }));
  });

  it('Feature 6: InitialLoadsPage permite descargar plantilla oficial y validar archivo de carga inicial (CU-CIN-001)', () => {
    render(
      <MemoryRouter initialEntries={['/initial-loads']}>
        <Routes>
          <Route path="/initial-loads" element={<InitialLoadsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Cargas Iniciales para la Estructura Comercial/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar Plantilla Oficial/i })).toBeInTheDocument();
    expect(screen.getByText(/Selecciona o arrastra el archivo de carga inicial/i)).toBeInTheDocument();
  });
});
