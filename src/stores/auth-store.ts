import {
	authLogin,
	authProfile,
	authRefreshToken,
} from "@/api/generated/auth/auth";
import {
	getStoredToken,
	isTokenExpired,
	removeStoredRefreshToken,
	removeStoredToken,
	setStoredToken,
	updateStoredToken,
} from "@/lib/auth";
import type { ILoginSchema } from "@/schemas/login/LoginSchema";
import type { AuthenticatedUser, AuthState } from "@/types/AuthenticatedUser";
import { onError } from "@/utils/on-error";
import type { AxiosError } from "axios";
import { create, type StateCreator } from "zustand";
import { usePermissionStore } from "./permission-store";
import { CustomToaster } from "@/utils/custom-toaster";
import i18n from "@/i18n";

interface AuthActions {
	signIn: (data: ILoginSchema) => Promise<void>;
	signOut: () => void;
	refreshAccessToken: () => Promise<void>;
	hydrateUser: () => Promise<AuthenticatedUser>;
	setUser: (user: AuthenticatedUser | null) => void;
	setToken: (token: string) => void;
	setRefreshToken: (token: string) => void;
	clearError: () => void;
	initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const authStoreCreator: StateCreator<AuthStore> = (set, get) => ({
	...(() => {
		const initialToken = getStoredToken();
		return {
			token: initialToken,
			isAuthenticated: Boolean(initialToken),
			isLoading: Boolean(initialToken),
		};
	})(),
	user: null,
	refreshToken: null,
	error: null,
	_isInitializing: false,

	hydrateUser: async () => {
		const response = await authProfile();

		if (response.error || !response.data) {
			throw new Error(response.message || "Erro ao buscar usuário logado");
		}

		const apiUser = response.data.user;
		const permissions = response.data.permissions || [];
		const roles = apiUser.role || [];

		const authenticatedUser = {
			...apiUser,
			profile_pic: apiUser.profile_pic ?? null,
		} as AuthenticatedUser;

		usePermissionStore.getState().setPermissions(permissions, roles);

		set({ user: authenticatedUser });

		return authenticatedUser;
	},

	initialize: async () => {
		// Evitar múltiplas chamadas simultâneas
		if (get()._isInitializing) {
			return;
		}

		const token = getStoredToken();
		if (!token) {
			set({
				token: null,
				isAuthenticated: false,
				isLoading: false,
				refreshToken: null,
				user: null,
				_isInitializing: false,
			});
			return;
		}

		// Se já tem usuário e token válido, não precisa inicializar novamente
		if (get().user && !isTokenExpired(token)) {
			set({ isLoading: false });
			return;
		}

		set({
			isAuthenticated: true,
			token,
			refreshToken: null,
			isLoading: true,
			_isInitializing: true,
		});

		if (!isTokenExpired(token)) {
			try {
				await get().hydrateUser();
			} finally {
				set({ isLoading: false, _isInitializing: false });
			}
			return;
		}

		try {
			await get().refreshAccessToken();
			await get().hydrateUser();
			set({ isAuthenticated: true, isLoading: false, _isInitializing: false });
		} catch {
			set({ isAuthenticated: false, isLoading: false, _isInitializing: false });
		}
	},

	signIn: async (data: ILoginSchema) => {
		set({ isLoading: true, error: null });
		try {
			const response = await authLogin(data);

			if (response.error || !response.data) {
				throw new Error(response.message || "Erro ao fazer login");
			}

			const { token } = response.data;

			setStoredToken(token);

			const user = await get().hydrateUser();

			set({
				user,
				token,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			});

			CustomToaster.successToast(i18n.t("toast.success.login"));
		} catch (error) {
			onError(error as AxiosError<{ message: string }>);
			const errorMessage =
				error instanceof Error ? error.message : "Erro ao fazer login";
			set({
				isLoading: false,
				error: errorMessage,
				isAuthenticated: false,
			});
			throw error;
		}
	},

	signOut: async () => {
		removeStoredToken();
		removeStoredRefreshToken();
		usePermissionStore.getState().clearPermissions();
		set({
			user: null,
			token: null,
			refreshToken: null,
			isAuthenticated: false,
			error: null,
		});
	},

	refreshAccessToken: async () => {
		try {
			const response = await authRefreshToken();

			if (response.error || !response.data) {
				throw new Error(response.message || "Erro ao atualizar token");
			}

			const { token } = response.data;

			updateStoredToken(token);

			set({
				token,
				refreshToken: null,
			});
		} catch (error) {
			get().signOut();
			throw error;
		}
	},

	setUser: (user: AuthenticatedUser | null) => {
		set({ user });
	},

	setToken: (token: string) => {
		updateStoredToken(token);
		set({ token });
	},

	setRefreshToken: (token: string) => {
		set({ refreshToken: token });
	},

	clearError: () => {
		set({ error: null });
	},
});

export const useAuthStore = create<AuthStore>(authStoreCreator);
