import { format, isValid, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

export const sanitizePhone = (phone: string): string => {
	if (!phone) return "";

	// Remove tudo que não for dígito
	const digits = phone.replace(/\D/g, "");

	// Se a string original tinha um "+", nós o devolvemos no início
	return phone.startsWith("+") ? `+${digits}` : digits;
};


type FormatDateLocale = "pt" | "en";
interface FormatDateTimeOptions {
  locale?: FormatDateLocale;
  pattern?: string;
  fallback?: string;
}


export function formatDateTime(
	value: string | Date | null | undefined,
	options?: FormatDateTimeOptions,
  ): string {
	const { locale = "pt", pattern = "dd/MM/yyyy HH:mm", fallback = "" } =
	  options ?? {};
	if (!value) return fallback;
	const date = typeof value === "string" ? parseISO(value) : value;
	if (!isValid(date)) return fallback;
	return format(date, pattern, {
	  locale: locale === "en" ? enUS : ptBR,
	});
  }
  

export function formatCNPJ(cnpj: string): string {
	return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}


type FormatCurrencyLocale = "pt" | "en";
interface FormatCurrencyOptions {
	locale?: FormatCurrencyLocale;
	currency?: string;
	fallback?: string;
}

/**
 * Converte o valor recebido da API (`"5000.00"`, `"5.000,00"`, `5000`) em número.
 * O separador decimal é o último `.` ou `,` encontrado; o outro é tratado como
 * separador de milhar.
 */
function parseAmount(value: string | number): number {
	if (typeof value === "number") return value;

	const normalized = value.replace(/[^\d,.-]/g, "");

	if (!normalized) return Number.NaN;

	const lastComma = normalized.lastIndexOf(",");
	const lastDot = normalized.lastIndexOf(".");

	if (lastComma === -1 && lastDot === -1) return Number(normalized);

	const decimalSeparator = lastComma > lastDot ? "," : ".";
	const thousandSeparator = decimalSeparator === "," ? "." : ",";

	return Number(
		normalized
			.split(thousandSeparator)
			.join("")
			.replace(decimalSeparator, "."),
	);
}

export function formatCurrency(
	value: string | number | null | undefined,
	options?: FormatCurrencyOptions,
): string {
	const {
		locale = "pt",
		currency = "BRL",
		fallback = "",
	} = options ?? {};

	if (value === null || value === undefined || value === "") return fallback;

	const amount = parseAmount(value);

	if (!Number.isFinite(amount)) return fallback;

	return new Intl.NumberFormat(locale === "en" ? "en-US" : "pt-BR", {
		style: "currency",
		currency,
	}).format(amount);
}