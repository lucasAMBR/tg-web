import { env } from "@/utils/env";

type StorageOptions = {
	remember?: boolean;
};

function isBrowser(): boolean {
	return (
		typeof window !== "undefined" && typeof window.localStorage !== "undefined"
	);
}

export function getStoredToken(): string | null {
	if (!isBrowser()) return null;

	const key = env.TOKEN_STORAGE_KEY;

	const sessionToken = window.sessionStorage.getItem(key);
	if (sessionToken) {
		return sessionToken;
	}

	return window.localStorage.getItem(key);
}

export function setStoredToken(token: string, options?: StorageOptions): void {
	if (!isBrowser()) return;

	const key = env.TOKEN_STORAGE_KEY;
	const remember = options?.remember ?? true;

	window.sessionStorage.removeItem(key);
	window.localStorage.removeItem(key);

	if (remember) {
		window.localStorage.setItem(key, token);
	} else {
		window.sessionStorage.setItem(key, token);
	}
}

export function updateStoredToken(token: string): void {
	if (!isBrowser()) return;

	const key = env.TOKEN_STORAGE_KEY;
	const hasSession = window.sessionStorage.getItem(key) !== null;
	const remember = !hasSession;

	setStoredToken(token, { remember });
}

export function removeStoredToken(): void {
	if (!isBrowser()) return;

	const key = env.TOKEN_STORAGE_KEY;
	window.localStorage.removeItem(key);
	window.sessionStorage.removeItem(key);
}

export function getStoredRefreshToken(): string | null {
	if (!isBrowser()) return null;

	const key = env.REFRESH_TOKEN_STORAGE_KEY;

	const sessionToken = window.sessionStorage.getItem(key);
	if (sessionToken) {
		return sessionToken;
	}

	return window.localStorage.getItem(key);
}

export function setStoredRefreshToken(
	token: string,
	options?: StorageOptions,
): void {
	if (!isBrowser()) return;

	const key = env.REFRESH_TOKEN_STORAGE_KEY;
	const remember = options?.remember ?? true;

	window.sessionStorage.removeItem(key);
	window.localStorage.removeItem(key);

	if (remember) {
		window.localStorage.setItem(key, token);
	} else {
		window.sessionStorage.setItem(key, token);
	}
}

export function updateStoredRefreshToken(token: string): void {
	if (!isBrowser()) return;

	const key = env.REFRESH_TOKEN_STORAGE_KEY;
	const hasSession = window.sessionStorage.getItem(key) !== null;
	const remember = !hasSession;

	setStoredRefreshToken(token, { remember });
}

export function removeStoredRefreshToken(): void {
	if (!isBrowser()) return;

	const key = env.REFRESH_TOKEN_STORAGE_KEY;
	window.localStorage.removeItem(key);
	window.sessionStorage.removeItem(key);
}

export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		const exp = payload.exp;
		if (!exp) return false;
		return Date.now() >= exp * 1000;
	} catch {
		return true;
	}
}

export function decodeToken(token: string): Record<string, unknown> | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload;
	} catch {
		return null;
	}
}
