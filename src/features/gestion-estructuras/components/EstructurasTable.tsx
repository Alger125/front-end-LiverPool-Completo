import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../app/config/routes';
import {
	BranchIcon,
	NodesIcon,
} from '../../../shared/components/AppIcons';
import { MOCK_NODE_HISTORY } from '../mocks/gestionEstructuras.mocks';
import type {
	OperationsChild,
	StructureSummary,
} from '../types/gestionEstructuras.types';
import { StructureActions } from './StructureActions';

interface EstructurasTableProps {
	rows: StructureSummary[];
	forceOpen?: boolean;
}

interface RecursiveChildRowProps {
	item: OperationsChild;
	depth: number;
	expandedIds: Set<string>;
	selectedId: string | null;
	forceOpen: boolean;
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	onHistory: (item: OperationsChild) => void;
}

function RecursiveOperationsRow({
	item,
	depth,
	expandedIds,
	selectedId,
	forceOpen,
	onToggle,
	onSelect,
	onHistory,
}: RecursiveChildRowProps) {
	const hasChildren = item.hijos.length > 0;
	const isExpanded = forceOpen || expandedIds.has(item.id);
	const isSelected = selectedId === item.id;

	return (
		<Fragment>
			<tr
				aria-selected={isSelected}
				className={
					isSelected
						? 'ge-table__row ge-table__row--selected'
						: 'ge-table__row'
				}
				onClick={() => onSelect(item.id)}
			>
				<td data-label="Nombre">
					<div
						className="ge-name-cell"
						style={{ paddingLeft: `${depth * 24}px` }}
					>
						<BranchIcon className="ge-level-icon" />

						<button
							aria-expanded={hasChildren ? isExpanded : undefined}
							className="ge-name-button"
							onClick={(event) => {
								event.stopPropagation();
								onSelect(item.id);
								if (hasChildren) {
									onToggle(item.id);
								}
							}}
							type="button"
						>
							{hasChildren ? (
								<span aria-hidden="true" className="ge-chevron">
									{isExpanded ? '▾ ' : '▸ '}
								</span>
							) : null}
							<span>{item.nombre}</span>
						</button>

						{item.esAncla ? (
							<span className="ge-badge ge-badge--anchor">
								🔒 Sección Ancla
							</span>
						) : null}

						{item.publicacionFutura ? (
							<span className="ge-badge ge-badge--future">
								📅 Pub. {item.publicacionFutura}
							</span>
						) : null}
					</div>
				</td>

				<td data-label="Responsable">
					<div className="ge-responsible-cell">
						{item.esVacante ? (
							<span className="ge-badge ge-badge--vacant">Vacante</span>
						) : (
							<strong>{item.responsable}</strong>
						)}
						{item.esHeredado ? (
							<span className="ge-badge ge-badge--inherited">↳ Heredado</span>
						) : null}
						{item.puestoResponsable && !item.esVacante ? (
							<span className="ge-responsible-role">
								{item.puestoResponsable}
							</span>
						) : null}
					</div>
				</td>

				<td data-label="Estructura">{item.resumen}</td>

				<td data-label="Acciones">
					<StructureActions
						item={item}
						mode="operations"
						onHistory={(node) => onHistory(node as OperationsChild)}
					/>
				</td>
			</tr>

			{hasChildren &&
				isExpanded &&
				item.hijos.map((child) => (
					<RecursiveOperationsRow
						depth={depth + 1}
						expandedIds={expandedIds}
						forceOpen={forceOpen}
						item={child}
						key={child.id}
						onHistory={onHistory}
						onSelect={onSelect}
						onToggle={onToggle}
						selectedId={selectedId}
					/>
				))}
		</Fragment>
	);
}

export function EstructurasTable({
	rows,
	forceOpen = false,
}: EstructurasTableProps) {
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState<Set<string>>(
		() =>
			new Set([
				'operation-insurgentes',
				'management-ins-1',
				'department-1',
				'group-001',
			]),
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [historyItem, setHistoryItem] = useState<OperationsChild | null>(null);

	const toggleExpanded = (id: string) => {
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

	if (rows.length === 0) {
		return (
			<div className="ge-empty" role="status">
				No se encontraron estructuras para los filtros seleccionados.
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
						{rows.map((row) => {
							const hasManagements = row.hijos.length > 0;
							const isRowExpanded = forceOpen || expandedIds.has(row.id);
							const isRowSelected = selectedId === row.id;

							return (
								<Fragment key={row.id}>
									<tr
										aria-selected={isRowSelected}
										className={
											isRowSelected
												? 'ge-table__row ge-table__row--selected'
												: 'ge-table__row'
										}
										onClick={() => setSelectedId(row.id)}
									>
										<td data-label="Nombre">
											<div className="ge-name-cell">
												<NodesIcon className="ge-level-icon" />

												<button
													aria-expanded={
														hasManagements ? isRowExpanded : undefined
													}
													className="ge-name-button"
													onClick={(event) => {
														event.stopPropagation();
														setSelectedId(row.id);
														if (hasManagements) {
															toggleExpanded(row.id);
														}
													}}
													type="button"
												>
													{hasManagements ? (
														<span aria-hidden="true" className="ge-chevron">
															{isRowExpanded ? '▾ ' : '▸ '}
														</span>
													) : null}
													<span>{row.nombre}</span>
												</button>

												{row.negocio ? (
													<span className="ge-badge ge-badge--business">
														{row.negocio}
													</span>
												) : null}
											</div>
										</td>

										<td data-label="Responsable">
											<div className="ge-responsible-cell">
												<strong>{row.responsable}</strong>
												{row.puestoResponsable ? (
													<span className="ge-responsible-role">
														{row.puestoResponsable}
													</span>
												) : null}
											</div>
										</td>
										<td data-label="Estructura">{row.resumen}</td>
										<td data-label="Acciones" />
									</tr>

									{hasManagements &&
										isRowExpanded &&
										row.hijos.map((management) => (
											<RecursiveOperationsRow
												depth={1}
												expandedIds={expandedIds}
												forceOpen={forceOpen}
												item={management}
												key={management.id}
												onHistory={(node) => setHistoryItem(node)}
												onSelect={setSelectedId}
												onToggle={toggleExpanded}
												selectedId={selectedId}
											/>
										))}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>

			{historyItem ? (
				<div
					aria-labelledby="ops-history-modal-title"
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
								<h2 className="ge-modal-title" id="ops-history-modal-title">
									Historial: {historyItem.nombre}
								</h2>
								<p className="ge-modal-subtitle">
									Responsable: {historyItem.responsable} · {historyItem.resumen}
								</p>
							</div>
							<button
								aria-label="Cerrar historial"
								className="ge-modal-close"
								onClick={() => setHistoryItem(null)}
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
								onClick={() => setHistoryItem(null)}
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