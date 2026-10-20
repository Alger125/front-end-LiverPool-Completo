const dateTimeFormatter = new Intl.DateTimeFormat('es', {
	dateStyle: 'medium',
	timeStyle: 'short',
});

/** Formats an ISO `date-time` value for display. */
export function formatDateTime(isoValue: string): string {
	return dateTimeFormatter.format(new Date(isoValue));
}
