const SKELETON_ROW_COUNT = 5;
const SKELETON_COLUMN_COUNT = 7;

/** Placeholder rows shown while the initial roles query is pending. */
export function RoleTableSkeleton() {
	return (
		<table aria-hidden="true">
			<tbody>
				{Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
					<tr key={rowIndex}>
						{Array.from({ length: SKELETON_COLUMN_COUNT }, (_, columnIndex) => (
							<td key={columnIndex}>▬▬▬</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
