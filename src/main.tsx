import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Providers } from './app/providers';

import "./index.css";
import "./app/styles/reference.css";

async function enableMocking(): Promise<void> {
    if (!import.meta.env.DEV) {
        return;
    }

    if (import.meta.env.VITE_USE_MOCKS === 'false') {
        return;
    }

    const { worker } = await import('./mocks/browser');

    await worker.start({
        onUnhandledRequest(request, print) {
            const url = new URL(request.url);

            if (url.pathname.startsWith('/api/v1')) {
                print.warning();
            }
        },
    });
}

function renderApp(): void {
    const container =
        document.getElementById('root');

    if (!container) {
        throw new Error(
            'Root element "#root" was not found.',
        );
    }

    createRoot(container).render(
        <StrictMode>
            <Providers />
        </StrictMode>,
    );
}

async function bootstrap(): Promise<void> {
    try {
        await enableMocking();
    } catch (error: unknown) {
        console.error(
            '[Bootstrap] Failed to start MSW.',
            error,
        );
    }

    renderApp();
}

void bootstrap();