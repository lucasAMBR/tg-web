import { useCallback, useEffect, useRef, useState } from "react";
import {
	joinDevJobVacancyInterview,
	leaveDevJobVacancyInterview,
	signalDevJobVacancyInterview,
} from "@/api/generated/dev-job-vacancy-interview/dev-job-vacancy-interview";
import type { SignalDevJobVacancyInterviewRequestType } from "@/api/generated/models";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth-store";
import type { InterviewParty } from "@/types/dev-job-vacancy-interview";
import { env } from "@/utils/env";

/**
 * - `joining`: negociando o acesso com a API e pedindo câmera/microfone
 * - `waiting`: já na sala, aguardando a outra pessoa entrar
 * - `connected`: fluxo P2P estabelecido
 * - `ended`: a call foi encerrada por um dos dois lados
 */
export type CallPhase =
	| "idle"
	| "joining"
	| "waiting"
	| "connected"
	| "ended"
	| "error";

/** Motivo do erro, para a tela escolher a mensagem certa. */
export type CallError = "media" | "join" | "connection";

const getToken = () => useAuthStore.getState().token;

/** Intervalo entre os reanúncios da descrição local enquanto a call não conecta. */
const RESEND_INTERVAL_MS = 5_000;

/**
 * Tempo máximo para fechar a conexão depois que o outro lado já apareceu. Só vale
 * a partir do primeiro sinal recebido: esperar sozinho na sala é legítimo e pode
 * durar o quanto for, mas negociar com alguém presente e não conectar é falha.
 */
const NEGOTIATION_TIMEOUT_MS = 25_000;

interface SignalEvent {
	from: string;
	type: string;
	payload: unknown;
}

interface UseInterviewCallOptions {
	interviewId: string;
	/** A call só é montada quando a sala está aberta na tela. */
	enabled: boolean;
	/** Chamado quando a call termina, para a tela recarregar a entrevista. */
	onEnded?: () => void;
}

export function useInterviewCall({
	interviewId,
	enabled,
	onEnded,
}: UseInterviewCallOptions) {
	const [phase, setPhase] = useState<CallPhase>("idle");
	const [error, setError] = useState<CallError | null>(null);
	const [role, setRole] = useState<InterviewParty | null>(null);
	const [micEnabled, setMicEnabled] = useState(true);
	const [cameraEnabled, setCameraEnabled] = useState(true);

	const localStreamRef = useRef<MediaStream | null>(null);
	const remoteStreamRef = useRef<MediaStream | null>(null);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

	const peerRef = useRef<RTCPeerConnection | null>(null);
	const channelNameRef = useRef<string | null>(null);
	const roleRef = useRef<InterviewParty | null>(null);

	// Estado da "perfect negotiation" (padrão MDN), que resolve o glare de os dois
	// lados criarem uma offer ao mesmo tempo
	const makingOfferRef = useRef(false);
	const ignoredOfferRef = useRef(false);

	/** ICE candidates locais, reenviados quando o outro lado entra atrasado. */
	const localCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
	/** ICE candidates que chegaram antes da descrição remota e ficaram na fila. */
	const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

	const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const negotiationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	const onEndedRef = useRef(onEnded);
	onEndedRef.current = onEnded;

	const sendSignal = useCallback(
		(type: SignalDevJobVacancyInterviewRequestType, payload: unknown) => {
			// O contrato gerado tipa `payload` como string, mas a API repassa o valor
			// cru (SDP ou ICE candidate) sem interpretá-lo
			return signalDevJobVacancyInterview(interviewId, {
				type,
				payload: payload as unknown as string,
			}).catch((error) => {
				// Um sinal perdido é recuperado pelo reenvio periódico, então não derruba
				// a call — mas precisa aparecer, senão a falha vira um spinner mudo
				console.error(`[interview] falha ao enviar sinal "${type}"`, error);
			});
		},
		[interviewId],
	);

	/** Encerra tudo que a call abriu: mídia, peer connection e canal. */
	const teardown = useCallback(() => {
		if (retryRef.current) {
			clearInterval(retryRef.current);
			retryRef.current = null;
		}

		if (negotiationTimeoutRef.current) {
			clearTimeout(negotiationTimeoutRef.current);
			negotiationTimeoutRef.current = null;
		}

		peerRef.current?.close();
		peerRef.current = null;

		for (const track of localStreamRef.current?.getTracks() ?? []) {
			track.stop();
		}

		localStreamRef.current = null;
		remoteStreamRef.current = null;
		setLocalStream(null);
		setRemoteStream(null);

		if (channelNameRef.current) {
			getEcho(getToken).leaveChannel(`private-${channelNameRef.current}`);
			channelNameRef.current = null;
		}

		localCandidatesRef.current = [];
		pendingCandidatesRef.current = [];
		makingOfferRef.current = false;
		ignoredOfferRef.current = false;
	}, []);

	/** Sai da call: avisa a API (o que encerra para os dois) e desmonta tudo. */
	const hangUp = useCallback(async () => {
		teardown();
		setPhase("ended");

		try {
			await leaveDevJobVacancyInterview(interviewId);
		} finally {
			onEndedRef.current?.();
		}
	}, [interviewId, teardown]);

	const toggleMic = useCallback(() => {
		const tracks = localStreamRef.current?.getAudioTracks() ?? [];

		setMicEnabled((enabledBefore) => {
			const next = !enabledBefore;

			for (const track of tracks) track.enabled = next;

			return next;
		});
	}, []);

	const toggleCamera = useCallback(() => {
		const tracks = localStreamRef.current?.getVideoTracks() ?? [];

		setCameraEnabled((enabledBefore) => {
			const next = !enabledBefore;

			for (const track of tracks) track.enabled = next;

			return next;
		});
	}, []);

	useEffect(() => {
		if (!enabled) return;

		// Evita aplicar o resultado de um `join` cujo componente já foi desmontado
		let cancelled = false;

		const start = async () => {
			setPhase("joining");
			setError(null);

			let media: MediaStream;

			try {
				media = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
			} catch {
				// Sem câmera (ou sem permissão) a entrevista ainda acontece só com áudio
				try {
					media = await navigator.mediaDevices.getUserMedia({
						video: false,
						audio: true,
					});
					setCameraEnabled(false);
				} catch {
					if (!cancelled) {
						setError("media");
						setPhase("error");
					}
					return;
				}
			}

			if (cancelled) {
				for (const track of media.getTracks()) track.stop();
				return;
			}

			localStreamRef.current = media;
			setLocalStream(media);

			let joinData: Awaited<
				ReturnType<typeof joinDevJobVacancyInterview>
			>["data"];

			try {
				joinData = (await joinDevJobVacancyInterview(interviewId)).data;
			} catch {
				if (!cancelled) {
					setError("join");
					setPhase("error");
				}
				return;
			}

			if (cancelled) return;

			const myRole = joinData.role as InterviewParty;

			roleRef.current = myRole;
			channelNameRef.current = joinData.channel;
			setRole(myRole);

			// A empresa é o lado "polite": em caso de colisão de offers é ela que
			// desfaz a própria proposta e aceita a do dev
			const polite = myRole === "company";

			const peer = new RTCPeerConnection({
				iceServers: joinData.ice_servers as RTCIceServer[],
			});

			peerRef.current = peer;

			for (const track of media.getTracks()) peer.addTrack(track, media);

			const remote = new MediaStream();
			remoteStreamRef.current = remote;
			setRemoteStream(remote);

			peer.ontrack = ({ track, streams }) => {
				const [stream] = streams;

				if (stream) {
					remoteStreamRef.current = stream;
					setRemoteStream(stream);
					return;
				}

				remote.addTrack(track);
				// A referência não muda, então força o React a reavaliar o vídeo remoto
				setRemoteStream(new MediaStream(remote.getTracks()));
			};

			peer.onicecandidate = ({ candidate }) => {
				if (!candidate) return;

				const serialized = candidate.toJSON();

				localCandidatesRef.current.push(serialized);
				sendSignal("candidate", serialized);
			};

			peer.onnegotiationneeded = async () => {
				try {
					makingOfferRef.current = true;
					await peer.setLocalDescription();
					await sendSignal("offer", peer.localDescription);
				} catch {
					// A renegociação seguinte refaz a proposta
				} finally {
					makingOfferRef.current = false;
				}
			};

			peer.onconnectionstatechange = () => {
				if (cancelled) return;

				if (peer.connectionState === "connected") {
					if (negotiationTimeoutRef.current) {
						clearTimeout(negotiationTimeoutRef.current);
						negotiationTimeoutRef.current = null;
					}

					setPhase("connected");
					return;
				}

				if (peer.connectionState === "failed") {
					setError("connection");
					setPhase("error");
				}
			};

			/** Aplica os candidates que chegaram antes da descrição remota. */
			const flushPendingCandidates = async () => {
				const pending = pendingCandidatesRef.current;
				pendingCandidatesRef.current = [];

				for (const candidate of pending) {
					await peer.addIceCandidate(candidate).catch((error) => {
						console.error("[interview] ICE candidate da fila recusado", error);
					});
				}
			};

			/**
			 * O relay não guarda histórico: quem entra depois perde os candidates já
			 * enviados, então eles são reenviados junto de cada descrição.
			 */
			const resendLocalCandidates = async () => {
				for (const candidate of localCandidatesRef.current) {
					await sendSignal("candidate", candidate);
				}
			};

			const handleSignal = async ({ from, type, payload }: SignalEvent) => {
				// O relay devolve o sinal para o próprio remetente também
				if (from === roleRef.current) return;

				// A partir daqui o outro lado está presente: se a conexão não fechar,
				// é falha de negociação e não espera legítima
				if (!negotiationTimeoutRef.current) {
					negotiationTimeoutRef.current = setTimeout(() => {
						if (cancelled || peer.connectionState === "connected") return;

						setError("connection");
						setPhase("error");
					}, NEGOTIATION_TIMEOUT_MS);
				}

				if (type === "candidate") {
					const candidate = payload as RTCIceCandidateInit;

					if (!peer.remoteDescription) {
						pendingCandidatesRef.current.push(candidate);
						return;
					}

					await peer.addIceCandidate(candidate).catch((error) => {
						console.error("[interview] ICE candidate recusado", error);
					});
					return;
				}

				const description = payload as RTCSessionDescriptionInit;

				// Uma answer repetida (reenvio da rede de segurança abaixo) chega com a
				// conexão já estável e faria `setRemoteDescription` estourar
				if (
					description.type === "answer" &&
					peer.signalingState !== "have-local-offer"
				) {
					return;
				}

				const offerCollision =
					description.type === "offer" &&
					(makingOfferRef.current || peer.signalingState !== "stable");

				ignoredOfferRef.current = !polite && offerCollision;

				if (ignoredOfferRef.current) {
					// A colisão normalmente significa que o outro lado acabou de entrar e
					// perdeu a offer anterior, então ela é reenviada com os candidates
					await sendSignal("offer", peer.localDescription);
					await resendLocalCandidates();
					return;
				}

				await peer.setRemoteDescription(description);
				await flushPendingCandidates();

				if (description.type === "offer") {
					await peer.setLocalDescription();
					await sendSignal("answer", peer.localDescription);
					await resendLocalCandidates();
				}
			};

			getEcho(getToken)
				.private(joinData.channel)
				.listen(".signal", (event: SignalEvent) => {
					// Um sinal fora de ordem é recuperado pela renegociação, mas o erro
					// precisa ficar visível: foi exatamente aqui que a corrupção do SDP
					// pelo trim do backend virou um "aguardando" infinito e silencioso
					handleSignal(event).catch((error) => {
						console.error(
							`[interview] falha ao processar sinal "${event.type}" de ${event.from}`,
							error,
						);
					});
				});

			// O relay não tem histórico e a inscrição no canal leva alguns instantes,
			// então quem entra primeiro pode perder a resposta do outro. Enquanto a
			// conexão não fecha, a descrição local é reanunciada periodicamente
			retryRef.current = setInterval(() => {
				if (peer.connectionState === "connected" || !peer.localDescription) {
					return;
				}

				sendSignal(
					peer.localDescription.type as SignalDevJobVacancyInterviewRequestType,
					peer.localDescription,
				);
				resendLocalCandidates();
			}, RESEND_INTERVAL_MS);

			setPhase("waiting");
		};

		start();

		return () => {
			cancelled = true;
			teardown();
		};
	}, [enabled, interviewId, sendSignal, teardown]);

	// Fechar a aba no meio da call precisa encerrá-la para o outro lado também
	useEffect(() => {
		if (!enabled) return;

		// `sendBeacon` não carrega o header de autorização, então o `leave` sai por
		// um fetch com `keepalive`, que sobrevive ao fechamento da aba
		const handleUnload = () => {
			fetch(`${env.API_BASE_URL}/dev-vacancy-interview/${interviewId}/leave`, {
				method: "POST",
				keepalive: true,
				headers: { Authorization: `Bearer ${getToken()}` },
			}).catch(() => {});
		};

		window.addEventListener("beforeunload", handleUnload);

		return () => window.removeEventListener("beforeunload", handleUnload);
	}, [enabled, interviewId]);

	return {
		phase,
		error,
		role,
		localStream,
		remoteStream,
		micEnabled,
		cameraEnabled,
		toggleMic,
		toggleCamera,
		hangUp,
	};
}
