/**
 * Campos multipart de arquivo que o Scramble declara como `type: ["array", "null"]`.
 * O orval não reconhece o array por trás do `null` e gera um `formData.append`
 * único em vez de iterar a lista, o que não compila. Como `nullable` aqui só
 * significa "campo opcional", o `null` é removido antes da geração.
 */
module.exports = (spec) => {
	for (const schema of Object.values(spec.components?.schemas ?? {})) {
		for (const property of Object.values(schema?.properties ?? {})) {
			const isNullableArray =
				Array.isArray(property?.type) &&
				property.type.length === 2 &&
				property.type.includes("array") &&
				property.type.includes("null");

			if (isNullableArray && property.items?.format === "binary") {
				property.type = "array";
			}
		}
	}

	return spec;
};
