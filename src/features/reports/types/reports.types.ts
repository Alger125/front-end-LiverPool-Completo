export type ReportType = 'role' | 'general';

export interface ReportFilterCriteria {
  periodMode: 'monthYear' | 'dateRange';
  year: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  business: string;
  zone: string;
  location: string;
  division: string;
  department: string;
  center: string;
  position: string;
  functionName: string;
  collaborator: string;
}

export interface ReportColumnDefinition {
  id: string;
  label: string;
  category: 'estructura' | 'puestos' | 'relaciones';
  defaultSelected: boolean;
}

export interface ReportDataRow {
  id: string;
  negocio: string;
  zona: string;
  ubicacion: string;
  gerencia: string;
  departamento: string;
  grupo: string;
  seccion: string;
  seccionAncla: string;
  numeroEmpleado: string;
  colaborador: string;
  puesto: string;
  rolSistema: string;
  tipoAsignacion: string;
  correo: string;
  responsableTitular: string;
  vigenciaInicio: string;
  vigenciaFin: string;
  estatus: 'Vigente' | 'Pendiente' | 'Expirado';
}
