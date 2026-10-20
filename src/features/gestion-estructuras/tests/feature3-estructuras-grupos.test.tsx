import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import CorporativoPage from '../pages/CorporativoPage';
import DepartmentGroupsPage from '../pages/DepartmentGroupsPage';
import OperacionesPage from '../pages/OperacionesPage';

describe('Feature 3 — Gestión de Estructuras, Grupos y Secciones (CU-EST-001, CU-ADM-001..004)', () => {
  it('CU-EST-001: CorporativoPage expande niveles hasta Grupo y Sección sin N/A y abre el historial del nodo', () => {
    render(
      <MemoryRouter initialEntries={['/structures/corporate']}>
        <Routes>
          <Route path="/structures/corporate" element={<CorporativoPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Estructura Comercial Corporativa'),
    ).toBeInTheDocument();

    // Por defecto PAC viene expandido hasta Grupo 001..006 con responsables reales (sin N/A)
    expect(screen.getByText(/Grupo 001/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Diego Morales Ruiz/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sección Ancla/i).length).toBeGreaterThan(0);

    // Abrir historial de Grupo 001
    const historyBtns = screen.getAllByRole('button', {
      name: /Ver historial de Grupo 001/i,
    });
    fireEvent.click(historyBtns[0]);
    expect(
      screen.getByRole('dialog', { name: /Historial:/i }),
    ).toBeInTheDocument();
  });

  it('CU-EST-001: OperacionesPage filtra por negocio y muestra ubicaciones, gerencias, departamentos, grupos y secciones', () => {
    render(
      <MemoryRouter initialEntries={['/structures/operations']}>
        <Routes>
          <Route path="/structures/operations" element={<OperacionesPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Estructura Comercial de Operaciones'),
    ).toBeInTheDocument();

    // Liverpool Insurgentes (0001) viene expandido por defecto mostrando Gerencia, Depto, Grupo 001 y sus secciones
    expect(
      screen.getByText(/Liverpool Insurgentes \(0001\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gerencia Almacén 1L — Damas y Belleza/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Departamento Vestidos de Fiesta \(110\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Grupo 001 — Gala y Noche/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sección 101 — Vestidos de Gala \(Ancla\)/i),
    ).toBeInTheDocument();
  });

  it('CU-ADM-001, CU-ADM-002 y CU-ADM-003: DepartmentGroupsPage bloquea eliminar grupo con Sección Ancla y permite eliminar grupo elegible', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/structures/operations/departments/dep-perfumeria/groups?groupId=group-001',
        ]}
      >
        <Routes>
          <Route
            path="/structures/operations/departments/:departmentId/groups"
            element={<DepartmentGroupsPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Grupo 001 tiene sección ancla 101 - Fragancias Importadas
    expect(screen.getByText(/🔒 Sección Ancla/i)).toBeInTheDocument();

    // Intentar eliminar Grupo 001 -> Debe abrir modal "Movimiento no permitido" (CU-ADM-003)
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Grupo 001' }),
    );
    const blockedDialog = screen.getByRole('dialog');
    expect(
      within(blockedDialog).getByText('Movimiento no permitido'),
    ).toBeInTheDocument();
    fireEvent.click(
      within(blockedDialog).getByRole('button', { name: 'Entendido' }),
    );

    // Intentar eliminar Grupo 004 (sin sección ancla) -> Debe permitir confirmar y liberar secciones
    fireEvent.click(
      screen.getByRole('button', { name: 'Eliminar Grupo 004' }),
    );
    const confirmDialog = screen.getByRole('dialog');
    expect(
      within(confirmDialog).getByText(
        /¿Estás seguro de eliminar Grupo 004\?/i,
      ),
    ).toBeInTheDocument();
    fireEvent.click(
      within(confirmDialog).getByRole('button', { name: 'Eliminar grupo' }),
    );

    expect(
      screen.getByText(/Grupo 004 eliminado con éxito/i),
    ).toBeInTheDocument();
  });

  it('CU-ADM-004: Permite mover secciones entre grupos con bandeja de cambios pendientes y confirmación de impacto', () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/structures/operations/departments/dep-perfumeria/groups',
        ]}
      >
        <Routes>
          <Route
            path="/structures/operations/departments/:departmentId/groups"
            element={<DepartmentGroupsPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Cambiar a la pestaña 3: Mover Secciones entre Grupos (CU-ADM-004)
    fireEvent.click(
      screen.getByRole('tab', {
        name: /3\. Mover Secciones entre Grupos/i,
      }),
    );

    // En Grupo 001, la sección 102 no es ancla y tiene botón "Mover al destino →"
    const moveButtons = screen.getAllByRole('button', {
      name: /Mover al destino →/i,
    });
    expect(moveButtons.length).toBeGreaterThan(0);
    fireEvent.click(moveButtons[0]);

    // Ahora aparece en la bandeja de cambios pendientes
    expect(
      screen.getByRole('button', { name: /← Regresar al origen/i }),
    ).toBeInTheDocument();

    // Abrir modal de confirmación de movimientos
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar movimientos \(1\)/i }),
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(/Confirmar movimientos de secciones/i),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: /Confirmar y aplicar movimientos/i,
      }),
    );

    expect(
      screen.getByText(
        /Se aplicaron 1 movimiento\(s\) de secciones entre grupos con éxito/i,
      ),
    ).toBeInTheDocument();
  });
});
