import { isoDateOnlyField, optionalIsoDateOnlyField } from "@/schemas/helpers/iso-date-only-field";
import z from "zod/v3";

export const UpdateJobHistorySchema = z.object({
	company_name: z
		.string()
		.min(3, "The company name must have at least 3 characters")
		.max(255, "The company name have a maximum lenght of 255 chracters"),
	company_location: z
		.string()
		.min(2, "The company location must have at least 2 chracters")
		.max(255, "The company location have a maximum lenght of 255 chracters"),
	position_name: z
		.string()
		.min(2, "The position name have at least 2 chracters")
		.max(255, "The position name have a maximum lenght of 255 chracters"),
	employment_type: z
		.string()
		.min(2, "The employment type must have at least 2 chracters")
		.max(255, "The employment type have a maximum lenght of 255 chracters"),
	contract_type: z
		.string()
		.min(2, "The contract type must have at least 2 chracters")
		.max(255, "The contract type have a maximum lenght of 255 chracters"),
	seniority_level: z
		.string()
		.min(2, "The seniority level must have at least 2 chracters")
		.max(255, "The seniority level have a maximum lenght of 255 chracters"),
	actuation_details: z
		.string()
		.min(2, "The actuation details must have at least 2 chracters")
		.max(600, "The actuation details have a maximum lenght of 600 chracters"),
	is_current: z.boolean(),
	start_date: isoDateOnlyField(),
	end_date: optionalIsoDateOnlyField(),
});

export type IUpdateJobHistorySchema = z.infer<typeof UpdateJobHistorySchema>;
