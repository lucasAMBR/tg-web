export interface ApiError {
	message: string;
	code?: string;
	errors?: Record<string, string[]>;
}
