import { PatternFormat, type PatternFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

export const CnpjInput = (props: PatternFormatProps) => {
	return (
		<PatternFormat
			{...props}
			placeholder="CNPJ"
			customInput={Input}
			format="##.###.###/####-##"
			mask="_"
		/>
	);
};