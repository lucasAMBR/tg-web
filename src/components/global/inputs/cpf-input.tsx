import { PatternFormat, type PatternFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
export const CpfInput = (props: PatternFormatProps) => {
	const { t } = useTranslation();

	return (
		<PatternFormat
			{...props}
			placeholder={t("placeholder.cpf")}
			customInput={Input}
			format="###.###.###-##"
			mask="_"
		/>
	);
};
