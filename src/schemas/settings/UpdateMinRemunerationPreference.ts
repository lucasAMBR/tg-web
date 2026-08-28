import z from "zod/v3";

export const UpdateMinRemunerationPreferences = z.object({
    min_remuneration: z.number().min(0).max(1000000).nullable(),
});

export type IUpdateMinRemunerationPreferences = z.infer<typeof UpdateMinRemunerationPreferences>