import { useAuthStore } from "@/stores/auth-store";
import { usePermissionStore } from "@/stores/permission-store";
import {
	type FreelanceFeedPost,
	FreelanceFeedPostType,
	type FreelanceProposal,
	FreelanceProposalStatus,
	FreelanceStatus,
	type FreelanceVacancy,
	isContractedDev,
	isFreelanceOwner,
} from "@/types/freelance";
import { getUserMainRole } from "@/utils/role-helper";

/**
 * Quais ações do módulo freelance a interface mostra. A API valida de novo o
 * papel, o dono e o status e responde 403 ou 422; esconder o botão aqui serve só
 * para não oferecer o que vai falhar.
 *
 * O admin tem todas as permissões, mas no módulo ele só vê a listagem e o
 * detalhe: as ações conferem também o papel.
 */
export function useFreelancePermissions() {
	const user = useAuthStore((state) => state.user);
	const hasPermission = usePermissionStore((state) => state.hasPermission);

	const role = getUserMainRole(user);

	const isClient = role === "client";
	const isDev = role === "dev";

	const isOwner = (vacancy: FreelanceVacancy | undefined) =>
		isClient && isFreelanceOwner(vacancy, user);

	const isContracted = (vacancy: FreelanceVacancy | undefined) =>
		isDev && isContractedDev(vacancy, user);

	const isOpen = (vacancy: FreelanceVacancy | undefined) =>
		vacancy?.status === FreelanceStatus.open;

	const isInProgress = (vacancy: FreelanceVacancy | undefined) =>
		vacancy?.status === FreelanceStatus.in_progress;

	/** O feed existe só entre as duas pontas do contrato, depois que ele fecha. */
	const canViewFeed = (vacancy: FreelanceVacancy | undefined) =>
		!!vacancy &&
		!isOpen(vacancy) &&
		(isOwner(vacancy) || isContracted(vacancy)) &&
		hasPermission("freelance_feed.view");

	const canPostFeed = (vacancy: FreelanceVacancy | undefined) =>
		canViewFeed(vacancy) &&
		isInProgress(vacancy) &&
		hasPermission("freelance_feed.create");

	const isPendingProposal = (proposal: FreelanceProposal | null | undefined) =>
		proposal?.status === FreelanceProposalStatus.pending;

	return {
		user,
		role,
		isClient,
		isDev,
		isOwner,
		isContracted,
		canCreateVacancy: isClient && hasPermission("client_job_vacancy.create"),
		canEditVacancy: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isOpen(vacancy) &&
			hasPermission("client_job_vacancy.update"),
		canDeleteVacancy: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isOpen(vacancy) &&
			hasPermission("client_job_vacancy.delete"),
		canCompleteVacancy: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isInProgress(vacancy) &&
			hasPermission("client_job_vacancy.update"),
		/** Orçamentos, ranking e devs recomendados do freela. */
		canManageProposals: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isOpen(vacancy) &&
			hasPermission("freelance_proposal.view"),
		/** Aceitar e convidar usam o `update` do freela. */
		canAcceptProposal: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isOpen(vacancy) &&
			hasPermission("client_job_vacancy.update"),
		canInvite: (vacancy: FreelanceVacancy | undefined) =>
			isOwner(vacancy) &&
			isOpen(vacancy) &&
			hasPermission("client_job_vacancy.update"),
		canPropose: (vacancy: FreelanceVacancy | undefined) =>
			isDev && isOpen(vacancy) && hasPermission("freelance_proposal.create"),
		canEditProposal: (
			vacancy: FreelanceVacancy | undefined,
			proposal: FreelanceProposal | null | undefined,
		) =>
			isDev &&
			isOpen(vacancy) &&
			isPendingProposal(proposal) &&
			hasPermission("freelance_proposal.update"),
		canWithdrawProposal: (
			vacancy: FreelanceVacancy | undefined,
			proposal: FreelanceProposal | null | undefined,
		) =>
			isDev &&
			isOpen(vacancy) &&
			isPendingProposal(proposal) &&
			hasPermission("freelance_proposal.delete"),
		canViewFeed,
		canPostFeed,
		/** O cliente só posta atualização; a review sai da própria entrega. */
		feedPostTypes: (vacancy: FreelanceVacancy | undefined) => {
			if (!canPostFeed(vacancy)) return [];

			return isContracted(vacancy)
				? [FreelanceFeedPostType.update, FreelanceFeedPostType.deliverable]
				: [FreelanceFeedPostType.update];
		},
		canReviewDeliverable: (
			vacancy: FreelanceVacancy | undefined,
			post: FreelanceFeedPost,
		) =>
			post.type === FreelanceFeedPostType.deliverable &&
			isOwner(vacancy) &&
			canPostFeed(vacancy),
		canDeleteFeedPost: (
			vacancy: FreelanceVacancy | undefined,
			post: FreelanceFeedPost,
		) =>
			!!post.author &&
			post.author.id === user?.id &&
			canViewFeed(vacancy) &&
			isInProgress(vacancy) &&
			hasPermission("freelance_feed.delete"),
	};
}
