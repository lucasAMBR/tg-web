import type {
	AdminProfileResource,
	ClientProfileResource,
	CompanyProfileResource,
	DevProfileResource,
	UserResource,
} from "@/api/generated/models";

export type UserRole = "dev" | "company" | "client" | "admin";

export type AuthenticatedUser =
	| (UserResource & { role: ["dev"]; dev_profile: DevProfileResource | null })
	| (UserResource & {
			role: ["company"];
			company_profile: CompanyProfileResource | null;
	  })
	| (UserResource & {
			role: ["client"];
			client_profile: ClientProfileResource | null;
	  })
	| (UserResource & {
			role: ["admin"];
			admin_profile: AdminProfileResource | null;
			dev_profile: DevProfileResource | null;
			company_profile: CompanyProfileResource | null;
			client_profile: ClientProfileResource | null;
			admin_active_profile: UserRole | null;
	  });

export interface AuthState {
	user: AuthenticatedUser | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	_isInitializing: boolean;
}
