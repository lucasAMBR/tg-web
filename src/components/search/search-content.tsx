import SearchTab from "./search-tab";
import { Separator } from "../ui/separator";
import PopularProfiles from "./search-popular-profiles";

export default function SearchContent() {
	return (
		<div className="flex flex-1 flex-row gap-8">
			<div className="flex-2">
				<SearchTab />
			</div>
			<Separator orientation="vertical" />
			<div className="flex-1">
				<PopularProfiles />
			</div>
		</div>
	);
}
