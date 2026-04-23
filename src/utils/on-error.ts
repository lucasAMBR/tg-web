import type { AxiosError } from "axios";

import { toast } from "sonner";

export const onError = (error: AxiosError<{ message: string }>) => {
	if (error.response?.data?.message) {
		toast.error(error.response.data.message);
	} else {
		toast.error("Ocorreu um erro inesperado. Tente novamente mais tarde.");
	}
};
