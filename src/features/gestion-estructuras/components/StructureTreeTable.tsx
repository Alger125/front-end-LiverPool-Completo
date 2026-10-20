import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../app/config/routes';
import { MOCK_NODE_HISTORY } from '../mocks/gestionEstructuras.mocks';
import type { StructureNode } from '../types/gestionEstructuras.types';
import { StructureTreeRow } from './StructureTreeRow';

interface StructureTreeTableProps {
	nodes: StructureNode[];
	forceOpen?: boolean;
}

export function StructureTreeTable({
	nodes,
	forceOpen = false,
}: StructureTreeTableProps) {
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() =>
			new Set([
				'd1',
				'g3',
				'c4',
				'group-001',
				'dir-hardline',
				'ger-hl-1',
				'coord-hl-1',
				'dir-softline',
				'ger-sl-1',
				'coord-sl-1',
			]),
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [historyNode, setHistoryNode] = useState<StructureNode | null>(null);

	const toggleNode = (id: string) => {
		setExpandedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	if (nodes.length === 0) {
		return (
			<div className="ge-empty" role="status">
				No se encontraron estructuras con el criterio seleccionado.
			</div>
		);
	}

	return (
		<>
			<div className="ge-table-container">
				<table className="ge-table">
					<thead>
						<tr>
							<th scope="col">Nombre / Nivel Jerárquico</th>
							<th scope="col">Responsable / Puesto</th>
							<th scope="col">Estructura / Secciones</th>
							<th scope="col">Acciones</th>
						</tr>
					</thead>

					<tbody>
						{nodes.map((node) => (
							<StructureTreeRow
								depth={0}
								expandedIds={expandedIds}
								forceOpen={forceOpen}
								key={node.id}
								node={node}
								onHistory={(item) => setHistoryNode(item)}
								onSelect={setSelectedId}
								onToggle={toggleNode}
								selectedId={selectedId}
							/>
						))}
					</tbody>
				</table>
			</div>

			{historyNode ? (
				<div
					aria-labelledby="node-history-modal-title"
					aria-modal="true"
					className="ge-modal-backdrop"
					role="dialog"
				>
					<div className="ge-modal-card">
						<header className="ge-modal-header">
							<div>
								<span className="ge-badge ge-badge--future">
									Bitácora de Auditoría
								</span>
								<h2 className="ge-modal-title" id="node-history-modal-title">
									Historial: {historyNode.nombre}
								</h2>
								<p className="ge-modal-subtitle">
									Responsable actual: {historyNode.responsable} ·{' '}
									{historyNode.resumen}
								</p>
							</div>
							<button
								aria-label="Cerrar historial"
								className="ge-modal-close"
								onClick={() => setHistoryNode(null)}
								type="button"
							>
								✕
							</button>
						</header>

						<div className="ge-modal-body">
							<ul className="ge-history-list">
								{MOCK_NODE_HISTORY.map((entry) => (
									<li className="ge-history-item" key={entry.id}>
										<div className="ge-history-item__top">
											<strong>{entry.accion}</strong>
											<span>{entry.fecha}</span>
										</div>
										<p className="ge-history-item__detail">{entry.detalle}</p>
										<span className="ge-history-item__meta">
											Por: {entry.usuario} · Aplicación: {entry.fechaAplicacion}
										</span>
									</li>
								))}
							</ul>
						</div>

						<footer className="ge-modal-footer">
							<button
								className="ge-btn ge-btn--secondary"
								onClick={() => setHistoryNode(null)}
								type="button"
							>
								Cerrar
							</button>
							<button
								className="ge-btn ge-btn--primary"
								onClick={() => navigate(APP_ROUTES.history)}
								type="button"
							>
								Ir al módulo de Historial completo →
							</button>
						</footer>
					</div>
				</div>
			) : null}
		</>
	);
}