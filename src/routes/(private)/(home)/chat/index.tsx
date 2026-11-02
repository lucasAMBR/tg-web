import { createFileRoute } from "@tanstack/react-router";
import ChatPage from "@/components/chat/chat-page";
import { pageTitle } from "@/utils/page-title";
import {
	ensureAuthenticated,
	ensureProfileCreated,
} from "@/utils/route-guards";

export const Route = createFileRoute("/(private)/(home)/chat/")({
	head: () => ({ meta: [{ title: pageTitle("chat") }] }),
	staticData: { breadcrumb: { labelKey: "page_title.chat" } },
	component: ChatPage,
	beforeLoad: async () => {
		await ensureAuthenticated();
		await ensureProfileCreated();
	},
});
