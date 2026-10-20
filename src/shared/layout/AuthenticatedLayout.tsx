import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { visibleNavigationItems } from '../../app/config/navigation';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { PageContainer } from './PageContainer';

export function AuthenticatedLayout() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const mainRef = useRef<HTMLElement>(null);
	const { pathname } = useLocation();

	useEffect(() => {
		mainRef.current?.focus();
	}, [pathname]);

	return (
		<div className="authenticated-layout">
			<a className="skip-link" href="#main-content">
				Saltar al contenido
			</a>
			<AppHeader onMenuToggle={() => setIsSidebarOpen((isOpen) => !isOpen)} />
			<AppSidebar
				isOpen={isSidebarOpen}
				items={visibleNavigationItems}
				onNavigate={() => setIsSidebarOpen(false)}
			/>
			<main id="main-content" ref={mainRef} tabIndex={-1}>
				<PageContainer>
					<Outlet />
				</PageContainer>
			</main>
		</div>
	);
}
