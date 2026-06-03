import type { AuthenticatedUser, UserRole } from "@/types/AuthenticatedUser";

export const getRole = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	return user.role[0] as UserRole;
}

export const getNameFromProfile = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.name;
	if (role === "company") return user.company_profile?.name;
	if (role === "client") return user.client_profile?.name;
};

export const getRoleLabel = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return "role.dev";
	if (role === "company") return "role.company";
	if (role === "client") return "role.client";
};

export const getProfileBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio;
	if (role === "company") return user.company_profile?.bio;
	if (role === "client") return user.client_profile?.bio;
};

export const getProfilePortugueseBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio_pt;
	if (role === "company") return user.company_profile?.bio_pt;
	if (role === "client") return user.client_profile?.bio_pt;
};

export const getProfileEnglishBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio_en;
	if (role === "company") return user.company_profile?.bio_en;
	if (role === "client") return user.client_profile?.bio_en;
};

export const getProfileScore = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.score;
	if (role === "company") return user.company_profile?.score;
	if (role === "client") return user.client_profile?.score;
};

export const getUserMainRole = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	return role;
};
