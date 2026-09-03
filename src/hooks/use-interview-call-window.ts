import { useEffect, useState } from "react";
import type { DevJobVacancyInterviewResource } from "@/api/generated/models";
import {
	type CallWindowState,
	getCallWindowState,
} from "@/types/dev-job-vacancy-interview";

/** Reavalia a janela da call a cada meio minuto, para o botão abrir sozinho. */
const TICK_INTERVAL_MS = 30_000;

export function useInterviewCallWindow(
	interview: DevJobVacancyInterviewResource,
): CallWindowState {
	const [state, setState] = useState<CallWindowState>(() =>
		getCallWindowState(interview),
	);

	useEffect(() => {
		setState(getCallWindowState(interview));

		const interval = setInterval(
			() => setState(getCallWindowState(interview)),
			TICK_INTERVAL_MS,
		);

		return () => clearInterval(interval);
	}, [interview]);

	return state;
}
