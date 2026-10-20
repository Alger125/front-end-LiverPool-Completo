import { Fragment } from 'react';

import {
	BranchIcon,
	NodesIcon,
} from '../../../shared/components/AppIcons';
import type { StructureNode } from '../types/gestionEstructuras.types';
import { StructureActions } from './StructureActions';

interface StructureTreeRowProps {
	node: StructureNode;
	depth: number;
	expandedIds: Set<string>;
	selectedId: string | null;
	forceOpen: boolean;
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	onHistory?: (node: StructureNode) => void;
}

export function StructureTreeRow({
	node,
	depth,
	expandedIds,
	selectedId,
	forceOpen,
	onToggle,
	onSelect,
	onHistory,
}: StructureTreeRowProps) {
	const hasChildren = Boolean(node.hijos?.length);
	const isExpanded = forceOpen || expandedIds.has(node.id);
	const isSelected = selectedId === node.id;
	const isRoot = depth === 0;

	return (
		<Fragment>
			<tr
				aria-selected={isSelected}
				className={
					isSelected
						? 'ge-table__row ge-table__row--selected'
						: 'ge-table__row'
				}
				onClick={() => onSelect(node.id)}
			>
				<td data-label="Nombre">
					<div
						className="ge-name-cell"
						style={{ paddingLeft: `${depth * 24}px` }}
					>
						{isRoot ? (
							<NodesIcon className="ge-level-icon" />
						) : (
							<BranchIcon className="ge-level-icon" />
						)}

						<button
							aria-expanded={hasChildren ? isExpanded : undefined}
							className="ge-name-button"
							onClick={(event) => {
								event.stopPropagation();
								onSelect(node.id);
								if (hasChildren) {
									onToggle(node.id);
								}
							}}
							type="button"
						>
							{hasChildren ? (
								<span aria-hidden="true" className="ge-chevron">
									{isExpanded ? '▾ ' : '▸ '}
								</span>
							) : null}
							<span>{node.nombre}</span>
						</button>

						{node.esAncla ? (
							<span className="ge-badge ge-badge--anchor">
								🔒 Sección Ancla
							</span>
						) : null}

						{node.publicacionFutura ? (
							<span className="ge-badge ge-badge--future">
								📅 Pub. {node.publicacionFutura}
							</span>
						) : null}
					</div>
				</td>

				<td data-label="Responsable">
					<div className="ge-responsible-cell">
						{node.esVacante ? (
							<span className="ge-badge ge-badge--vacant">Vacante</span>
						) : (
							<strong>{node.responsable}</strong>
						)}
						{node.esHeredado ? (
							<span className="ge-badge ge-badge--inherited">↳ Heredado</span>
						) : null}
						{node.puestoResponsable && !node.esVacante ? (
							<span className="ge-responsible-role">
								{node.puestoResponsable}
							</span>
						) : null}
					</div>
				</td>

				<td data-label="Estructura">{node.resumen}</td>

				<td data-label="Acciones">
					<StructureActions
						item={node}
						mode="corporate"
						onHistory={(item) => onHistory?.(item as StructureNode)}
					/>
				</td>
			</tr>

			{hasChildren &&
				isExpanded &&
				node.hijos?.map((child) => (
					<StructureTreeRow
						depth={depth + 1}
						expandedIds={expandedIds}
						forceOpen={forceOpen}
						key={child.id}
						node={child}
						onHistory={onHistory}
						onSelect={onSelect}
						onToggle={onToggle}
						selectedId={selectedId}
					/>
				))}
		</Fragment>
	);
}