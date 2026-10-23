import type { AvailableSection, CommercialGroup } from '../types/groupManagement.types';

/** Department data used by the Liverpool reference organigram and its group editor. */
export const LINEA_BLANCA_SECTIONS: AvailableSection[] = [
  {
    id: 'refrigeracion',
    code: 'SEC-001',
    name: 'Refrigeración',
    description: 'Refrigeradores y congeladores',
    isAnchorCandidate: true,
    anchoredCollaborators: ['Jazmín Cruz'],
  },
  { id: 'lavado', code: 'SEC-002', name: 'Lavado', description: 'Lavadoras y secadoras' },
];
export const LINEA_BLANCA_GROUPS: CommercialGroup[] = [
  {
    id: 'group-001',
    name: 'Grupo 001',
    description: 'Refrigeración y lavado',
    sectionIds: ['refrigeracion', 'lavado'],
    anchorSectionIds: ['refrigeracion'],
    responsables: ['Jazmín Cruz'],
    updatedAt: '01 Ago 2026',
  },
  {
    id: 'group-002',
    name: 'Grupo 002',
    description: 'Grupo comercial',
    sectionIds: [],
    anchorSectionIds: [],
    responsables: ['Jazmín Cruz'],
    esHeredado: true,
    updatedAt: '01 Ago 2026',
  },
  {
    id: 'group-003',
    name: 'Grupo 003',
    description: 'Grupo comercial',
    sectionIds: [],
    anchorSectionIds: [],
    responsables: ['Jazmín Cruz'],
    esHeredado: true,
    updatedAt: '01 Ago 2026',
  },
];
