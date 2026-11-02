import { keepPreviousData } from "@tanstack/react-query";
import {
	useShowAdminDashboard,
	useShowCompanyDashboard,
} from "@/api/generated/dashboard/dashboard";
import type {
	AdminDashboard,
	CompanyDashboard,
	DashboardMonths,
} from "@/types/dashboard";

/**
 * Cada `months` é uma entrada separada no cache. Ao trocar o período, a tela
 * continua mostrando o anterior até o novo chegar, em vez de piscar o skeleton.
 * Sem polling: os dados recarregam quando a tela abre.
 */
export function useCompanyDashboard(months: DashboardMonths) {
	return useShowCompanyDashboard(
		{ months },
		{
			query: {
				select: (response) => response.data as unknown as CompanyDashboard,
				placeholderData: keepPreviousData,
				retry: false,
			},
		},
	);
}

export function useAdminDashboard(months: DashboardMonths) {
	return useShowAdminDashboard(
		{ months },
		{
			query: {
				select: (response) => response.data as unknown as AdminDashboard,
				placeholderData: keepPreviousData,
				retry: false,
			},
		},
	);
}
