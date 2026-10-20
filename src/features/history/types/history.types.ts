export interface AuditHistoryEvent {
  id: string;
  fecha: string;
  hora: string;
  accion: string;
  modulo: string;
  usuario: string;
  numeroEmpleado: string;
  rol: string;
  ubicacion: string;
  departamento: string;
  detalle: string;
  valorAnterior?: string;
  valorNuevo?: string;
  motivo: string;
  fechaAplicacion: string;
}

export interface HistoryFilterState {
  dateFrom: string;
  dateTo: string;
  location: string;
  action: string;
  userQuery: string;
}
