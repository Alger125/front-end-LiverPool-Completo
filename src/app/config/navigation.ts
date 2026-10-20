import type { ComponentType } from 'react';

import { APP_ROUTES, accessManagementPath } from './routes';
import {
  SECURITY_PERMISSION_CODES,
  type SecurityPermissionCode,
} from '../../features/access-management/model/permission.model';

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: ComponentType;
  requiredPermission?: SecurityPermissionCode;
  children?: NavigationItem[];
  /** Registered but not yet published in the menu. */
  enabled: boolean;
}

export type UnauthorizedNavigationBehavior = 'hide' | 'disable';

// SUPUESTO TECNICO PENDIENTE DE VALIDACION: ocultar accesos no autorizados.
export const unauthorizedNavigationBehavior: UnauthorizedNavigationBehavior = 'hide';

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    path: APP_ROUTES.home,
    enabled: true,
  },
  {
    id: 'security',
    label: 'Seguridad',
    enabled: true,
    children: [
      {
        id: 'roles',
        label: 'Roles',
        path: APP_ROUTES.roles,
        requiredPermission: SECURITY_PERMISSION_CODES.ROLE_VIEW,
        enabled: true,
      },
      {
        id: 'assignments',
        label: 'Asignaciones',
        path: accessManagementPath('assignments'),
        requiredPermission: SECURITY_PERMISSION_CODES.ROLE_ASSIGNMENT_VIEW,
        // SUPUESTO TECNICO PENDIENTE DE VALIDACION: catalogo de permisos ubica Asignaciones en Fase 2.
        enabled: false,
      },
      {
        id: 'exceptions',
        label: 'Excepciones',
        path: accessManagementPath('exceptions'),
        requiredPermission: SECURITY_PERMISSION_CODES.ROLE_EXCEPTION_VIEW,
        // SUPUESTO TECNICO PENDIENTE DE VALIDACION: catalogo de permisos ubica Excepciones en Fase 3.
        enabled: false,
      },
    ],
  },
];

/**
 * Un item deshabilitado no debe pintarse ni siquiera como deshabilitado: en
 * el catalogo puede confundirse con "sin permiso". Se omite por completo del
 * menu, pero permanece registrado aqui arriba para cuando se publique.
 */
function filterEnabled(items: NavigationItem[]): NavigationItem[] {
  return items
    .filter((item) => item.enabled)
    .map((item) => (item.children ? { ...item, children: filterEnabled(item.children) } : item));
}

export const visibleNavigationItems: NavigationItem[] = filterEnabled(navigationItems);
