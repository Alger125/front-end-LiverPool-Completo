import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
	id: string;
	label: string;
	error?: FieldError;
	children: ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
	return (
		<div>
			<label htmlFor={id}>{label}</label>
			{children}
			{error ? (
				<p id={`${id}-error`} role="alert">
					{error.message}
				</p>
			) : null}
		</div>
	);
}
