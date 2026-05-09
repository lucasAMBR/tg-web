import z from "zod/v3";

export const UpdateJobTypePreferences = z.object({
    allow_clt: z.boolean(),
    allow_contractor: z.boolean(),
    allow_internship: z.boolean()
});

export type IUpdateJobTypePreferences = z.infer<typeof UpdateJobTypePreferences>