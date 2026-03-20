import type { ClientProfileModel, CompanyProfileModel, DevProfileModel, UserModel } from "@/api/generated/models";

export type UserRole = 'dev' | 'company' | 'client';

export type AuthenticatedUser = 
  | (UserModel & { role: ['dev']; dev_profile: DevProfileModel | null })
  | (UserModel & { role: ['company']; company_profile: CompanyProfileModel | null })
  | (UserModel & { role: ['client']; client_profile: ClientProfileModel | null });

export interface AuthState {
    user: AuthenticatedUser | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	_isInitializing: boolean;
}