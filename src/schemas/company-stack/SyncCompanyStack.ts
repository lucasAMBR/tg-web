import z from "zod/v3";

export const SyncCompanyStack = z.object({
    languages: z.string().array(),
})

export type ISyncCompanyStack = z.infer<typeof SyncCompanyStack>