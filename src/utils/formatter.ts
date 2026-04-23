export const sanitizePhone = (phone: string): string => {
	if (!phone) return "";

	// Remove tudo que não for dígito
	const digits = phone.replace(/\D/g, "");

	// Se a string original tinha um "+", nós o devolvemos no início
	return phone.startsWith("+") ? `+${digits}` : digits;
};
