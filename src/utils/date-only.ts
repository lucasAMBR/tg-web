import { format, isValid, parse, startOfDay } from "date-fns";

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse yyyy-MM-dd as a local calendar date.
 * `new Date("yyyy-MM-dd")` is UTC midnight and shifts the day in non-UTC zones.
 */
export function parseLocalDateFromIso(dateStr: string): Date | undefined {
	if (!ISO_DATE_ONLY.test(dateStr)) return undefined;

	const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
	return isValid(parsed) ? parsed : undefined;
}

/** Format a Date to yyyy-MM-dd using local date parts. */
export function formatDateOnly(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

export function isValidIsoDateOnly(dateStr: string): boolean {
	return parseLocalDateFromIso(dateStr) !== undefined;
}

export function isIsoDateOnlyOnOrBeforeToday(dateStr: string): boolean {
	const date = parseLocalDateFromIso(dateStr);
	if (!date) return false;

	return startOfDay(date) <= startOfDay(new Date());
}

/** Normalize API / form values to yyyy-MM-dd without UTC day shift. */
export function toIsoDateOnly(value: string | Date): string {
	if (typeof value === "string" && ISO_DATE_ONLY.test(value)) {
		return value;
	}

	const date =
		typeof value === "string"
			? (parseLocalDateFromIso(value) ?? new Date(value))
			: value;

	if (!isValid(date)) return "";

	return formatDateOnly(date);
}

/** Display yyyy-MM-dd (or normalized value) as dd/MM/yyyy. */
export function formatIsoDateOnlyBr(dateStr: string): string {
	const parsed = parseLocalDateFromIso(dateStr);
	if (parsed) return format(parsed, "dd/MM/yyyy");

	const date = new Date(dateStr);
	return isValid(date) ? format(date, "dd/MM/yyyy") : dateStr;
}
