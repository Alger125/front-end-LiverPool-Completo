import type { FieldErrors, FieldValues } from 'react-hook-form';

interface FormErrorSummaryProps<TFieldValues extends FieldValues> {
	errors: FieldErrors<TFieldValues>;
	title?: string;
}

/** Debe pintarse antes del contenido del paso, no solo junto a cada campo. */
export function FormErrorSummary<TFieldValues extends FieldValues>({
	errors,
	title = 'Revisa los siguientes campos:',
}: FormErrorSummaryProps<TFieldValues>) {
	const entries = Object.entries(errors);
	if (entries.length === 0) {
		return null;
	}

	return (
		<div role="alert">
			<p>{title}</p>
			<ul>
				{entries.map(([field, error]) => (
					<li key={field}>
						<a href={`#${field}`}>{(error?.message as string | undefined) ?? field}</a>
					</li>
				))}
			</ul>
		</div>
	);
}
