export type StructureLevel =
	| 'direccion'
	| 'gerencia'
	| 'coordinacion'
	| 'departamento'
	| 'grupo'
	| 'seccion';

export interface StructureNode {
	id: string;
	nivel: StructureLevel;
	nombre: string;
	responsable: string;
	puestoResponsable?: string;
	esVacante?: boolean;
	esHeredado?: boolean;
	esAncla?: boolean;
	publicacionFutura?: string;
	parentDepartmentId?: string;
	parentDepartmentName?: string;
	resumen: string;
	hijos?: StructureNode[];
}

export interface OperationsChild {
	id: string;
	nivel?: StructureLevel;
	nombre: string;
	responsable: string;
	puestoResponsable?: string;
	esVacante?: boolean;
	esHeredado?: boolean;
	esAncla?: boolean;
	publicacionFutura?: string;
	parentDepartmentId?: string;
	parentDepartmentName?: string;
	resumen: string;
	hijos: OperationsChild[];
}

export interface StructureSummary {
	id: string;
	negocio?: 'Liverpool' | 'Suburbia';
	zona?: string;
	nombre: string;
	responsable: string;
	puestoResponsable?: string;
	resumen: string;
	hijos: OperationsChild[];
}

export interface StructureHistoryEntry {
	id: string;
	fecha: string;
	usuario: string;
	accion: string;
	detalle: string;
	fechaAplicacion: string;
}