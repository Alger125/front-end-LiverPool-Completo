export function ForbiddenState({
	message = 'You do not have access to this resource.',
}: {
	message?: string;
}) {
	return <p role="alert">{message}</p>;
}
