import { isValid, parse } from "date-fns";
import z from "zod/v3";

/** Durações oferecidas no formulário, dentro do intervalo aceito pela API (5–1440). */
export const INTERVIEW_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;

/**
 * A API espera um único `scheduled_at`, mas data e horário são escolhidos em
 * campos separados — o envio junta os dois com `toScheduledAt()`.
 */
export const ScheduleInterviewSchema = z
	.object({
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (esperado: YYYY-MM-DD)"),
		time: z
			.string()
			.regex(/^\d{2}:\d{2}$/, "Formato inválido (esperado: HH:mm)"),
		duration_in_minutes: z.coerce
			.number()
			.int("A duração deve ser um número inteiro de minutos")
			.min(5, "A duração mínima é de 5 minutos")
			.max(1440, "A duração máxima é de 1440 minutos"),
	})
	// A API recusa horários no passado (`after:now`), então já barra aqui
	.refine(
		({ date, time }) => {
			const scheduledAt = parseScheduledAt(date, time);

			return scheduledAt !== undefined && scheduledAt > new Date();
		},
		{
			message: "O horário da entrevista precisa ser no futuro",
			path: ["time"],
		},
	);

export type IScheduleInterviewSchema = z.infer<typeof ScheduleInterviewSchema>;

/**
 * Junta os campos em uma data local. `new Date("YYYY-MM-DDTHH:mm")` varia entre
 * navegadores, então o parse é explícito.
 */
export function parseScheduledAt(date: string, time: string): Date | undefined {
	const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());

	return isValid(parsed) ? parsed : undefined;
}

/** Payload de `scheduled_at` esperado pela API, em ISO 8601 com fuso. */
export function toScheduledAt(date: string, time: string): string {
	return parseScheduledAt(date, time)?.toISOString() ?? "";
}
