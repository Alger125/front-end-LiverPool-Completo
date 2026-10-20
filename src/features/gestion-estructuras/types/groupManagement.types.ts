export interface CommercialGroup {
  id: string;
  name: string;
  description?: string;
  sectionIds: string[];
  anchorSectionIds?: string[];
  responsables?: string[];
  esHeredado?: boolean;
  updatedAt?: string;
  futurePublicationDate?: string;
  anchoredCollaboratorsCount?: number;
}

export interface AvailableSection {
  id: string;
  code?: string;
  name: string;
  description: string;
  isAnchorCandidate?: boolean;
  anchoredCollaborators?: string[];
}

export interface PendingSectionMovement {
  id: string;
  sectionId: string;
  sectionName: string;
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId: string;
  targetGroupName: string;
  impactedCollaborators: string[];
}

export interface ScheduledPublicationItem {
  id: string;
  effectiveDate: string;
  summary: string;
  groupName: string;
  author: string;
  status: 'Programada' | 'En validación';
}