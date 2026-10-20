import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import type { NavigationItem } from '../../app/config/navigation';
import { PermissionGuard, type GrantedPermissions } from '../permissions';

interface AppSidebarProps {
	grantedPermissions?: GrantedPermissions;
	isOpen: boolean;
	items: NavigationItem[];
	onNavigate: () => void;
}

function NavigationGroup({
	grantedPermissions,
	item,
	onNavigate,
}: Pick<AppSidebarProps, 'grantedPermissions' | 'onNavigate'> & { item: NavigationItem }) {
	const { pathname } = useLocation();
	const containsCurrentPath = item.children?.some((child) => child.path === pathname) ?? false;
	const [isExpanded, setIsExpanded] = useState(containsCurrentPath);

	useEffect(() => {
		if (containsCurrentPath) {
			setIsExpanded(true);
		}
	}, [containsCurrentPath]);

	return (
		<PermissionGuard
			grantedPermissions={grantedPermissions}
			requiredPermission={item.requiredPermission}
		>
			<li>
				<button
					aria-expanded={isExpanded}
					className="app-sidebar__group-button"
					type="button"
					onClick={() => setIsExpanded((expanded) => !expanded)}
				>
					{item.label}
				</button>
				{isExpanded ? (
					<ul className="app-sidebar__sub-list">
						{item.children?.map((child) => (
							<PermissionGuard
								grantedPermissions={grantedPermissions}
								key={child.id}
								requiredPermission={child.requiredPermission}
							>
								<li>
									<NavLink to={child.path ?? '#'} onClick={onNavigate}>
										{child.label}
									</NavLink>
								</li>
							</PermissionGuard>
						))}
					</ul>
				) : null}
			</li>
		</PermissionGuard>
	);
}

export function AppSidebar({
	grantedPermissions,
	isOpen,
	items,
	onNavigate,
}: AppSidebarProps) {
	return (
		<aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
			<nav aria-label="Navegacion principal">
				<ul className="app-sidebar__list">
					{items.map((item) =>
						item.children ? (
							<NavigationGroup
								grantedPermissions={grantedPermissions}
								item={item}
								key={item.id}
								onNavigate={onNavigate}
							/>
						) : (
							<PermissionGuard
								grantedPermissions={grantedPermissions}
								key={item.id}
								requiredPermission={item.requiredPermission}
							>
								<li>
									<NavLink to={item.path ?? '#'} onClick={onNavigate}>
										{item.label}
									</NavLink>
								</li>
							</PermissionGuard>
						),
					)}
				</ul>
			</nav>
		</aside>
	);
}
