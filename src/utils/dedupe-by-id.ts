/** Mantém só a primeira ocorrência de cada id, preservando a ordem recebida. */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
	const seen = new Set<string>();

	return items.filter((item) => {
		if (seen.has(item.id)) return false;

		seen.add(item.id);

		return true;
	});
}
