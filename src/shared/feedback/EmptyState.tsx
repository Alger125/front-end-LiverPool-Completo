import type { ReactNode } from 'react';

interface EmptyStateProps {
	message?: string;
	children?: ReactNode;
}

export function EmptyState({ message = 'No results.', children }: EmptyStateProps) {
	return (
		<div role="status">
			<p>{message}</p>
			{children}
		</div>
	);
}
