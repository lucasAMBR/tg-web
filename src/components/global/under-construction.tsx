import { AlertTriangle, BrickWallFire, Pickaxe, Stone } from "lucide-react";
import { Card } from "../ui/card";

export default function UnderConstruction() {
	return (
		<Card className="p-4 py-8 items-center justify-center">
			<div className="bg-muted flex p-3 text-primary rounded-lg">
				<AlertTriangle className="size-10" />
			</div>
			<h2 className="font-bold text-lg">
				This feature is actually under construction!
			</h2>
			<p>Please comeback later</p>
		</Card>
	);
}
