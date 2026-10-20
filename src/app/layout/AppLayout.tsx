import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import {
	LogoutModalFlow,
	type LogoutModalStep,
} from '../../features/authentication';
import { httpPost } from '../../shared/api';
import {
	clearStoredSession,
	getHasUnsavedChanges,
	listenCrossTabSessionEvents,
	onUnauthorized,
	useSession,
} from '../../shared/auth';
import { APP_ROUTES } from '../config/routes';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

import './AppLayout.css';

export function AppLayout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const session = useSession();

	const [logoutStep, setLogoutStep] = useState<LogoutModalStep>('closed');
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const unsubscribeUnauthorized = onUnauthorized(() => {
			clearStoredSession('EXPIRED');
			queryClient.clear();
			navigate(APP_ROUTES.sessionExpired, { replace: true });
		});

		const unsubscribeCrossTab = listenCrossTabSessionEvents((expired) => {
			queryClient.clear();
			navigate(
				expired ? APP_ROUTES.sessionExpired : APP_ROUTES.logoutSuccess,
				{ replace: true },
			);
		});

		return () => {
			unsubscribeUnauthorized();
			unsubscribeCrossTab();
		};
	}, [navigate, queryClient]);

	if (!session) {
		return <Navigate replace to={APP_ROUTES.login} />;
	}

	function handleInitiateLogout(): void {
		if (getHasUnsavedChanges()) {
			setLogoutStep('unsaved');
		} else {
			setLogoutStep('confirm');
		}
	}

	function handleConfirmLogout(): void {
		setLogoutStep('processing');
		void httpPost('/auth/logout', { closeType: 'MANUAL' }).catch(() => {
			// Non-blocking in offline/unit test mode
		});
		window.setTimeout(() => {
			clearStoredSession('MANUAL');
			queryClient.clear();
			setLogoutStep('closed');
			navigate(APP_ROUTES.logoutSuccess, { replace: true });
		}, 450);
	}

	function handleSimulateInactivityExpiration(): void {
		void httpPost('/auth/logout', { closeType: 'INACTIVITY' }).catch(() => {
			// Non-blocking in offline/unit test mode
		});
		clearStoredSession('INACTIVITY');
		queryClient.clear();
		navigate(APP_ROUTES.sessionExpired, { replace: true });
	}

	return (
		<div className="app-layout">
			<AppHeader
				displayName={session.user.fullName}
				onExpireSession={handleSimulateInactivityExpiration}
				onSignOut={handleInitiateLogout}
				onToggleSidebar={() => setSidebarOpen((open) => !open)}
			/>

			<div className="app-layout__body">
				{sidebarOpen ? (
					<div
						aria-hidden="true"
						className="app-layout__backdrop"
						onClick={() => setSidebarOpen(false)}
					/>
				) : null}

				<AppSidebar
					isOpen={sidebarOpen}
					onNavigate={() => setSidebarOpen(false)}
				/>

				<div className="app-layout__main">
					<main className="app-layout__content">
						<Outlet />
					</main>
				</div>
			</div>

			<LogoutModalFlow
				onCancel={() => setLogoutStep('closed')}
				onConfirmLogout={handleConfirmLogout}
				step={logoutStep}
			/>
		</div>
	);
}