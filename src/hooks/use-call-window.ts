import { useEffect, useState } from "react";
import {
	type CallWindowState,
	getCallWindowState,
	type ScheduledCall,
} from "@/types/scheduled-call";

/** Reavalia a janela da call a cada meio minuto, para o botão abrir sozinho. */
const TICK_INTERVAL_MS = 30_000;

export function useCallWindow(call: ScheduledCall): CallWindowState {
	const [state, setState] = useState<CallWindowState>(() =>
		getCallWindowState(call),
	);

	useEffect(() => {
		setState(getCallWindowState(call));

		const interval = setInterval(
			() => setState(getCallWindowState(call)),
			TICK_INTERVAL_MS,
		);

		return () => clearInterval(interval);
	}, [call]);

	return state;
}
