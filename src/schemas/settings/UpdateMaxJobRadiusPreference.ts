import z from "zod/v3";

export const UpdateMaxJobRadiusPreferences = z.object({
    on_site_job_radius: z.number().min(10).max(150),
    hybrid_jobs_radius: z.number().min(10).max(150),
});

export type IUpdateMaxJobRadiusPreferences = z.infer<typeof UpdateMaxJobRadiusPreferences>