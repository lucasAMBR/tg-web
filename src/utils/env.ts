const requiredEnvVars = [
	"VITE_API_BASE_URL",
	"VITE_API_SWAGGER_URL",
	"VITE_APP_NAME",
	"VITE_TOKEN_STORAGE_KEY",
	"VITE_REFRESH_TOKEN_STORAGE_KEY",
	"VITE_AWESOME_API_URL",
	"VITE_AWESOME_API_KEY",
	"VITE_STORAGE_URL",
] as const;

const optionalEnvVars = [
	"VITE_WS_KEY",
	"VITE_WS_HOST",
	"VITE_WS_PORT",
	"VITE_WSS_PORT",
	"VITE_WS_FORCE_TLS",
	"VITE_WS_AUTH_ENDPOINT",
	"VITE_WS_CLUSTER",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(key: EnvVar): string {
	const value = import.meta.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

function getOptionalEnvVar(
	key: (typeof optionalEnvVars)[number],
): string | undefined {
	return import.meta.env[key];
}

function getOptionalNumberEnvVar(
	key: (typeof optionalEnvVars)[number],
): number | undefined {
	const value = import.meta.env[key];
	if (!value) {
		return undefined;
	}

	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		throw new Error(`Environment variable ${key} must be a number: ${value}`);
	}

	return parsed;
}

export const env = {
	API_BASE_URL: getEnvVar("VITE_API_BASE_URL"),
	API_SWAGGER_URL: getEnvVar("VITE_API_SWAGGER_URL"),
	APP_NAME: getEnvVar("VITE_APP_NAME"),
	TOKEN_STORAGE_KEY: getEnvVar("VITE_TOKEN_STORAGE_KEY"),
	REFRESH_TOKEN_STORAGE_KEY: getEnvVar("VITE_REFRESH_TOKEN_STORAGE_KEY"),
	VITE_AWESOME_API_URL: getEnvVar("VITE_AWESOME_API_URL"),
	VITE_AWESOME_API_KEY: getEnvVar("VITE_AWESOME_API_KEY"),
	VITE_STORAGE_URL: getEnvVar("VITE_STORAGE_URL"),
	// WebSocket configuration
	WS_KEY: getOptionalEnvVar("VITE_WS_KEY"),
	WS_HOST: getOptionalEnvVar("VITE_WS_HOST"),
	WS_PORT: getOptionalNumberEnvVar("VITE_WS_PORT"),
	WSS_PORT: getOptionalNumberEnvVar("VITE_WSS_PORT"),
	WS_FORCE_TLS: getOptionalEnvVar("VITE_WS_FORCE_TLS") === "true",
	WS_AUTH_ENDPOINT: getOptionalEnvVar("VITE_WS_AUTH_ENDPOINT"),
	WS_CLUSTER: getOptionalEnvVar("VITE_WS_CLUSTER"),
} as const;
