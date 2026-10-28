import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectionProcessStageEnum } from "@/api/generated/models";

/**
 * A seleção de uma etapa fica no localStorage para o recrutador poder sair da
 * tela — abrir o perfil de um candidato, por exemplo — e voltar sem perder o
 * que já tinha marcado. Cada vaga e etapa tem sua própria chave.
 */
function getStorageKey(
	vacancyId: string,
	processStep: SelectionProcessStageEnum,
): string {
	return `${vacancyId}.${processStep}.scratch`;
}

function readStoredIds(key: string): string[] {
	try {
		const stored = localStorage.getItem(key);

		if (!stored) return [];

		const parsed = JSON.parse(stored);

		if (!Array.isArray(parsed)) return [];

		return parsed.filter((id): id is string => typeof id === "string");
	} catch {
		// localStorage indisponível (janela privada, cota estourada) ou conteúdo inválido
		return [];
	}
}

function writeStoredIds(key: string, ids: string[]): void {
	try {
		localStorage.setItem(key, JSON.stringify(ids));
	} catch {
		// Sem persistência a seleção continua funcionando apenas em memória
	}
}

interface UseStepSelectionParams {
	vacancyId: string;
	processStep: SelectionProcessStageEnum;
	/** Ids das candidaturas exibidas; usado para descartar seleções que saíram da etapa. */
	availableIds?: string[];
}

export function useStepSelection({
	vacancyId,
	processStep,
	availableIds,
}: UseStepSelectionParams) {
	const key = getStorageKey(vacancyId, processStep);

	// A chave viaja junto com os ids para nunca gravar a seleção de uma etapa em outra
	const [selection, setSelection] = useState(() => ({
		key,
		ids: readStoredIds(key),
	}));

	if (selection.key !== key) {
		setSelection({ key, ids: readStoredIds(key) });
	}

	const selectedIds = useMemo(
		() => (selection.key === key ? selection.ids : readStoredIds(key)),
		[selection, key],
	);

	useEffect(() => {
		writeStoredIds(selection.key, selection.ids);
	}, [selection]);

	// Candidatura que saiu da etapa (avaliada em outra aba, por exemplo) não fica presa na seleção
	useEffect(() => {
		if (!availableIds || availableIds.length === 0) return;

		setSelection((current) => {
			const available = new Set(availableIds);
			const ids = current.ids.filter((id) => available.has(id));

			return ids.length === current.ids.length ? current : { ...current, ids };
		});
	}, [availableIds]);

	const isSelected = useCallback(
		(applyId: string) => selectedIds.includes(applyId),
		[selectedIds],
	);

	const toggle = useCallback((applyId: string, selected: boolean) => {
		setSelection((current) => {
			const alreadySelected = current.ids.includes(applyId);

			if (selected === alreadySelected) return current;

			return {
				...current,
				ids: selected
					? [...current.ids, applyId]
					: current.ids.filter((id) => id !== applyId),
			};
		});
	}, []);

	const selectAll = useCallback((applyIds: string[]) => {
		setSelection((current) => ({ ...current, ids: [...applyIds] }));
	}, []);

	const clear = useCallback(() => {
		setSelection((current) => ({ ...current, ids: [] }));
	}, []);

	return { selectedIds, isSelected, toggle, selectAll, clear };
}
