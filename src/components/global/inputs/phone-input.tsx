import { PatternFormat, type PatternFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export const PhoneInput = (props: PatternFormatProps) => {
	return (
		<PatternFormat
			{...props}
			placeholder="Phone"
			customInput={Input}
			format="+## (##) #####-####"
			mask="_"
		/>
	);
};
