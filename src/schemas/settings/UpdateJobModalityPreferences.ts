import z from "zod/v3";

export const UpdateJobModalityPreferences = z.object({
    allow_on_site: z.boolean(),
    allow_hybrid: z.boolean(),
    allow_remote: z.boolean()
});

export type IUpdateJobModalityPreferences = z.infer<typeof UpdateJobModalityPreferences>