/** Mantém só a primeira ocorrência de cada chave, preservando a ordem recebida. */
export function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
	const seen = new Set<string>();

	return items.filter((item) => {
		const key = getKey(item);

		if (seen.has(key)) return false;

		seen.add(key);

		return true;
	});
}

/** Mantém só a primeira ocorrência de cada id, preservando a ordem recebida. */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
	return dedupeBy(items, (item) => item.id);
}
