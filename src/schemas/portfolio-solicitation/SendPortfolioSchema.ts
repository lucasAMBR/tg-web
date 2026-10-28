import z from "zod/v3";

export const SendPortfolioSchema = z.object({
	portfolio_url: z
		.string()
		.min(1, "The portfolio link is required")
		.url("The portfolio link must be a valid url")
		.max(255, "The max lenght of the portfolio link is 255"),
});

export type ISendPortfolioSchema = z.infer<typeof SendPortfolioSchema>;
