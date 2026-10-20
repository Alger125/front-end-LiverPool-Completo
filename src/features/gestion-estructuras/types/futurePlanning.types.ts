export type PlannedNodeStatus =
  | 'Vigente'
  | 'Modificado'
  | 'Nuevo'
  | 'Eliminado'
  | 'En edición';

export interface StructureDiffItem {
  id: string;
  departmentName: string;
  groupName: string;
  sectionCode: string;
  sectionName: string;
  currentResponsible: string;
  futureResponsible: string;
  currentGroup: string;
  futureGroup: string;
  isAnchor: boolean;
  status: PlannedNodeStatus;
  effectiveDate: string;
  impactedCollaborators: string[];
}

export interface OperationalCalendarMilestone {
  id: string;
  day: number;
  dateStr: string;
  title: string;
  description: string;
  isDeadline: boolean;
  isLocked: boolean;
  status: 'Completado' | 'En curso' | 'Próximo';
}

export interface ScheduledFuturePublication {
  id: string;
  departmentId: string;
  departmentName: string;
  sectionId: string;
  sectionName: string;
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId: string;
  targetGroupName: string;
  scheduledDate: string;
  scheduledTime: string;
  notes: string;
  author: string;
  status: 'Programada' | 'En validación' | 'Cancelada';
  impactedCollaborators: string[];
}

export interface DepartmentConcurrencyState {
  departmentId: string;
  departmentName: string;
  localVersion: number;
  remoteVersion: number;
  lastModifiedBy: string;
  lastModifiedDate: string;
  hasConflict: boolean;
}
