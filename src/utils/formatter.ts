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