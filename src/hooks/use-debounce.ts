import { useEffect, useState } from "react";

function useDebounce(value: string, msDelay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// Define um timer para atualizar o valor após o delay
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, msDelay);

		// Limpa o timer se o valor mudar ou o componente for desmontado
		return () => {
			clearTimeout(handler);
		};
	}, [value, msDelay]);

	return debouncedValue;
}

export default useDebounce;
