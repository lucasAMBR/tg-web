import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import CreateVacancyCard from "./create-vacancy-card";
import CreateVacancyForm from "./create-vacancy-form";
import MyVacanciesList from "./my-vacancies-list";
import PopularVacancies from "./popular-vacancies";

export default function MyVacanciesContent() {
	const { t } = useTranslation();

	const [searchTerm, setSearchTerm] = useState("");
	const [appliedSearch, setAppliedSearch] = useState("");

	const [creationIsOpen, setCreationIsOpen] = useState(false);

	function handleSearch(event: React.FormEvent) {
		event.preventDefault();

		setAppliedSearch(searchTerm.trim());
	}

	return (
		// No celular as vagas populares descem para depois da lista
		<div className="flex flex-1 flex-col gap-8 md:flex-row">
      <div className="md:flex-3 flex flex-col gap-4">
        <CreateVacancyCard
					creationIsOpen={creationIsOpen}
					onToggle={() => setCreationIsOpen(!creationIsOpen)}
				/>
				{!creationIsOpen && (
					<form className="flex flex-row gap-2" onSubmit={handleSearch}>
						<Input
							placeholder={t("my_vacancies.search_placeholder")}
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
						<Button type="submit" variant={"secondary"}>
							<Search /> {t("general.search")}
						</Button>
					</form>
				)}
				{creationIsOpen ? (
					<CreateVacancyForm
						onCreated={() => setCreationIsOpen(false)}
						onCancel={() => setCreationIsOpen(false)}
					/>
				) : (
					<MyVacanciesList search={appliedSearch} />
				)}
			</div>
			<Separator orientation="vertical" className="max-md:hidden" />
			<div className="md:flex-1">
				<PopularVacancies />
			</div>
		</div>
	);
}
