import { isIsoDateOnlyOnOrBeforeToday, isValidIsoDateOnly } from "@/utils/date-only";
import z from "zod/v3";

export function isoDateOnlyField(
	futureMessage = "A data de nascimento não pode ser no futuro!",
) {
	return z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (esperado: YYYY-MM-DD)")
		.refine(isValidIsoDateOnly, { message: "Data inválida" })
		.refine(isIsoDateOnlyOnOrBeforeToday, { message: futureMessage });
}

export function optionalIsoDateOnlyField(
	futureMessage = "A data de nascimento não pode ser no futuro!",
) {
	return isoDateOnlyField(futureMessage).optional();
}
