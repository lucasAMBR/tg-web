import type { AuthenticatedUser, UserRole } from "@/types/AuthenticatedUser";

export const getSenioritySoftSkillLimit = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role !== "dev") return;

	if (user.dev_profile?.seniority_level === undefined) return;

	if (user.dev_profile.seniority_level === "intern") return 15;
	if (user.dev_profile.seniority_level === "junior") return 25;
	if (user.dev_profile.seniority_level === "mid_level") return 35;
	if (user.dev_profile.seniority_level === "senior") return 45;
	if (user.dev_profile.seniority_level === "staff") return 50;
};
