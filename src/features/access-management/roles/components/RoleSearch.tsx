import { useId, useState, type FormEvent } from 'react';

const SEARCH_MAX_LENGTH = 100;

interface RoleSearchProps {
	initialValue?: string;
	onSearch: (term: string) => void;
}

export function RoleSearch({ initialValue = '', onSearch }: RoleSearchProps) {
	const inputId = useId();
	const [term, setTerm] = useState(initialValue);

	function handleChange(nextValue: string): void {
		const sliced = nextValue.slice(0, SEARCH_MAX_LENGTH);
		setTerm(sliced);
		onSearch(sliced.trim());
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		onSearch(term.trim().slice(0, SEARCH_MAX_LENGTH));
	}

	return (
		<form className="roles-search" onSubmit={handleSubmit} role="search">
			<div className="roles-search__field">
				<label className="roles-search__label" htmlFor={inputId}>
					Buscar rol
				</label>
				<div className="roles-search__controls">
					<input
						className="roles-search__input"
						id={inputId}
						maxLength={SEARCH_MAX_LENGTH}
						onChange={(event) => handleChange(event.target.value)}
						placeholder="Buscar por código, nombre o descripción"
						type="search"
						value={term}
					/>
					<button className="roles-search__submit" type="submit">
						Buscar
					</button>
				</div>
			</div>
		</form>
	);
}
