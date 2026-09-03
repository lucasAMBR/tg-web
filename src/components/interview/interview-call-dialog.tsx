import {
	Mic,
	MicOff,
	PhoneOff,
	User,
	Video,
	VideoOff,
	WifiOff,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { DevJobVacancyInterviewResource } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useInterviewCall } from "@/hooks/use-interview-call";
import { cn } from "@/lib/utils";

interface VideoTileProps {
	stream: MediaStream | null;
	/** O próprio vídeo é espelhado e mudo, para não gerar eco. */
	muted?: boolean;
	label: string;
	placeholder: React.ReactNode;
	className?: string;
}

function VideoTile({
	stream,
	muted,
	label,
	placeholder,
	className,
}: VideoTileProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	// `srcObject` não é um atributo do elemento, só dá para atribuir via ref
	useEffect(() => {
		const video = videoRef.current;

		if (!video) return;

		video.srcObject = stream;

		return () => {
			video.srcObject = null;
		};
	}, [stream]);

	const hasVideo = (stream?.getVideoTracks() ?? []).some(
		(track) => track.enabled && track.readyState === "live",
	);

	return (
		// `cn()` resolve o conflito de posicionamento: sem ele o `relative` daqui
		// venceria o `absolute` do PiP, porque a cascata do Tailwind não segue a
		// ordem da string de classes
		<div
			className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
		>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted={muted}
				className={cn("size-full object-cover", !hasVideo && "invisible")}
			>
				<track kind="captions" />
			</video>
			{!hasVideo && (
				<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
					{placeholder}
				</div>
			)}
			<span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
				{label}
			</span>
		</div>
	);
}

interface InterviewCallDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	interview: DevJobVacancyInterviewResource;
	/** Nome de quem está do outro lado da call. */
	counterpartName?: string | null;
	/** Chamado ao encerrar, para a tela recarregar a entrevista. */
	onEnded?: () => void;
}

export default function InterviewCallDialog({
	open,
	onOpenChange,
	interview,
	counterpartName,
	onEnded,
}: InterviewCallDialogProps) {
	const { t } = useTranslation();

	const {
		phase,
		error,
		localStream,
		remoteStream,
		micEnabled,
		cameraEnabled,
		toggleMic,
		toggleCamera,
		hangUp,
	} = useInterviewCall({
		interviewId: interview.id,
		enabled: open,
		onEnded,
	});

	const handleHangUp = async () => {
		onOpenChange(false);

		await hangUp();
	};

	// Fechar pelo "X" ou pelo Esc precisa encerrar a call na API também, senão a
	// entrevista fica sem `ended_at` e o outro lado continua esperando
	const handleOpenChange = (next: boolean) => {
		if (next) {
			onOpenChange(true);
			return;
		}

		handleHangUp();
	};

	const statusMessage = () => {
		if (phase === "error") {
			if (error === "media") return t("interview.call.media_error");
			if (error === "join") return t("interview.call.join_error");

			return t("interview.call.connection_error");
		}

		if (phase === "joining") return t("interview.call.connecting");
		if (phase === "waiting") return t("interview.call.waiting");
		if (phase === "ended") return t("interview.call.ended");

		return t("interview.call.connected");
	};

	const isLoading = phase === "joining";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="flex max-h-[90vh] w-[95vw] flex-col gap-4 sm:max-w-4xl"
				// Fechar por fora encerraria a call sem avisar a API
				onInteractOutside={(event) => event.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>{interview.title}</DialogTitle>
					<DialogDescription>{statusMessage()}</DialogDescription>
				</DialogHeader>

				{phase === "error" ? (
					<div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
						<WifiOff className="size-8 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">{statusMessage()}</p>
					</div>
				) : (
					<div className="relative aspect-video w-full">
						<VideoTile
							stream={remoteStream}
							label={counterpartName ?? t("interview.call.counterpart")}
							className="size-full"
							placeholder={
								isLoading || phase === "waiting" ? (
									<div className="flex flex-col items-center gap-2">
										<Spinner />
										<span className="text-sm">{statusMessage()}</span>
									</div>
								) : (
									<User className="size-12" />
								)
							}
						/>
						<VideoTile
							stream={localStream}
							muted
							label={t("interview.call.you")}
							className="absolute bottom-3 right-3 aspect-video w-32 border-2 border-background shadow-lg sm:w-44"
							placeholder={<VideoOff className="size-6" />}
						/>
					</div>
				)}

				<div className="flex flex-row items-center justify-center gap-2">
					<Button
						type="button"
						variant={micEnabled ? "secondary" : "destructive"}
						size={"icon"}
						disabled={!localStream}
						onClick={toggleMic}
						aria-label={
							micEnabled ? t("interview.call.mute") : t("interview.call.unmute")
						}
					>
						{micEnabled ? <Mic /> : <MicOff />}
					</Button>
					<Button
						type="button"
						variant={cameraEnabled ? "secondary" : "destructive"}
						size={"icon"}
						disabled={!localStream}
						onClick={toggleCamera}
						aria-label={
							cameraEnabled
								? t("interview.call.camera_off")
								: t("interview.call.camera_on")
						}
					>
						{cameraEnabled ? <Video /> : <VideoOff />}
					</Button>
					<Button type="button" variant={"destructive"} onClick={handleHangUp}>
						<PhoneOff />
						{t("interview.call.hang_up")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
