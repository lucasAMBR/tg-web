import { PatternFormat, type PatternFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

export const CpfInput = (props: PatternFormatProps) => {
  return (
    <PatternFormat
      {...props}
      placeholder="CPF"
      customInput={Input}
      format="###.###.###-##"
      mask="_"
    />
  );
}