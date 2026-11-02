import SearchTab from "./search-tab";
import { Separator } from "../ui/separator";
import PopularProfiles from "./search-popular-profiles";

export default function SearchContent() {
	return (
		// No celular os populares descem para depois da busca
		<div className="flex flex-1 flex-col gap-8 md:flex-row">
			<div className="md:flex-2">
				<SearchTab />
			</div>
			<Separator orientation="vertical" className="max-md:hidden" />
			<div className="md:flex-1">
				<PopularProfiles />
			</div>
		</div>
	);
}
