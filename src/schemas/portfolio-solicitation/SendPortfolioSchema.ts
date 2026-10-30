import z from "zod/v3";

export const SendPortfolioSchema = z.object({
	portfolio_url: z
		.string()
		.trim()
		.min(1, "O link do portfólio é obrigatório")
		.url("O link do portfólio precisa ser uma url válida")
		.max(255, "O link do portfólio pode ter no máximo 255 caracteres"),
});

export type ISendPortfolioSchema = z.infer<typeof SendPortfolioSchema>;
