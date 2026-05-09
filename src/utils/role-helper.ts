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

	if (role === "dev") return "Developer";
	if (role === "company") return "Company";
	if (role === "client") return "Client";
};

export const getProfileBio = (user: AuthenticatedUser | null) => {
	if (user === null) return;

	const role = user.role[0] as UserRole;

	if (role === "dev") return user.dev_profile?.bio;
	if (role === "company") return user.company_profile?.bio;
	if (role === "client") return user.client_profile?.bio;
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
