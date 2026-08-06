import { Button } from "../ui/button";
import { ChevronRight, ChevronDown } from "lucide-react"; // Importe o ChevronDown

import { motion } from "framer-motion";
import { Logo } from "../global/Logo";
import { useTranslation } from "react-i18next";

export default function Banner() {
	const { t } = useTranslation();

	return (
		<div className="relative flex w-full h-full flex-1 items-center justify-center overflow-hidden">
			<div
				className="absolute inset-0 z-0 
                           bg-[url('/images/Circuit_Board_lig.svg')] dark:bg-[url('/images/Circuit_Board_dar.svg')] 
                           bg-center bg-no-repeat bg-cover
                           opacity-6 dark:opacity-4"
				aria-hidden="true"
			/>

			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-1/2 min-h-40 max-h-[min(70vh,32rem)] bg-[linear-gradient(to_top,var(--background)_0%,transparent_100%)]"
				aria-hidden="true"
			/>

			<motion.div
				initial={{ opacity: 0, y: 100 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1 }}
				className="relative z-10 flex flex-col items-center justify-center gap-2"
			>
				<Logo 
					className="w-24 fill-primary"
				/>
				<h1 className="text-9xl font-[Anta] tracking-tight text-primary sm:text-6xl text-center">
					{t("landing_page.title")} <span className="font-[Agbalumo]">{t("landing_page.app_name")}</span>
				</h1>
				<h2 className="mb-6 text-xl font-[Anta] font-medium text-foreground">
					{t("landing_page.description")}
				</h2>
				<p className="max-w-prose dark:text-foreground/70 text-foreground/90 text-center text-lg font-medium">
					{t("landing_page.subdescription")}
				</p>
				<div className="flex gap-3 mt-6">
					<Button
						size={"lg"}
						variant={"secondary"}
						className="rounded-full text-lg"
					>
						{t("landing_page.rule_button")}
					</Button>
					<Button size={"lg"} className="rounded-full text-lg">
						{t("landing_page.know_more_button")} <ChevronRight />
					</Button>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.5, duration: 1 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
			>
				<motion.div
					animate={{ y: [0, 15, 0] }}
					transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
				>
					<ChevronDown className="size-12 text-primary" />
				</motion.div>
			</motion.div>
		</div>
	);
}
