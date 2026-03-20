import { defineConfig } from "orval";
import { loadEnv } from "vite";

const env = loadEnv(process.env.MODE ?? "development", process.cwd(), "");
const API_SWAGGER_URL = env.VITE_API_SWAGGER_URL ?? "";

if (!API_SWAGGER_URL) {
	throw new Error(
		"VITE_API_SWAGGER_URL não está definida. Configure no .env ou .env.local",
	);
}

export default defineConfig({
	api: {
		input: {
			target: API_SWAGGER_URL,
		},
		output: {
			mode: "tags-split",
			target: "./src/api/generated",
			schemas: "./src/api/generated/models",
			client: "react-query",
			mock: false,
			override: {
				mutator: {
					path: "./src/lib/api-client.ts",
					name: "apiClient",
					default: true,
				},
				query: {
					useQuery: true,
					useInfinite: false,
					useInfiniteQueryParam: "page",
				},
			},
		},
	},
});