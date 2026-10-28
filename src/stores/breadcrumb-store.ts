import { create, type StateCreator } from "zustand";

interface BreadcrumbState {
	/** Rótulos dinâmicos por `routeId`, definidos em runtime pelas páginas. */
	labels: Record<string, string>;
}

interface BreadcrumbActions {
	setLabel: (routeId: string, label: string) => void;
	clearLabel: (routeId: string) => void;
}

type BreadcrumbStore = BreadcrumbState & BreadcrumbActions;

const breadcrumbStoreCreator: StateCreator<BreadcrumbStore> = (set) => ({
	labels: {},

	setLabel: (routeId, label) =>
		set((state) =>
			state.labels[routeId] === label
				? state
				: { labels: { ...state.labels, [routeId]: label } },
		),

	clearLabel: (routeId) =>
		set((state) => {
			if (!(routeId in state.labels)) return state;

			const { [routeId]: _removed, ...rest } = state.labels;
			return { labels: rest };
		}),
});

export const useBreadcrumbStore = create<BreadcrumbStore>(
	breadcrumbStoreCreator,
);
