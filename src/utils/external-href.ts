/** Normalize stored URLs for safe use in anchor href (adds https if scheme missing). */
export function externalHref(raw: string): string {
	const u = raw.trim();
	if (!u) return "#";
	if (/^https?:\/\//i.test(u)) return u;
	return `https://${u}`;
}
