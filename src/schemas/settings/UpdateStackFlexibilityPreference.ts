import z from "zod/v3";

export const UpdateFlexibilityPreferences = z.object({
    allow_stack_flexibility: z.boolean(),
    languages_blacklist: z.string().array(),
});

export type IUpdateFlexibilityPreferences = z.infer<typeof UpdateFlexibilityPreferences>