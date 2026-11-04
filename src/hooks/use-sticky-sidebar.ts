import { type RefObject, useEffect } from "react";

/** Primeiro ancestral que rola na vertical: no layout privado, a área abaixo do header. */
function getScrollParent(element: HTMLElement): HTMLElement | null {
	let parent = element.parentElement;

	while (parent) {
		const { overflowY } = getComputedStyle(parent);

		if (overflowY === "auto" || overflowY === "scroll") return parent;

		parent = parent.parentElement;
	}

	return null;
}

/**
 * Coluna lateral `sticky` que acompanha a rolagem quando é mais alta que a área
 * visível: rolando para baixo, ela sobe com o conteúdo até o fim dela aparecer
 * e fica presa embaixo; rolando para cima, desce com o conteúdo até o começo
 * aparecer e fica presa em cima. Quando cabe inteira, fica presa em cima.
 *
 * O `top` e o `bottom` negativos prendem a coluna entre "fim visível" e
 * "começo visível". Entre os dois ela fica na posição normal, então quem a
 * move é a própria rolagem. Enquanto está presa, o espaçador logo antes dela
 * cresce ou diminui para a posição normal coincidir com a presa: ao inverter o
 * sentido, ela sai rolando de onde está, sem salto.
 *
 * O espaçador e a coluna ficam num wrapper da altura do conteúdo (o bloco de
 * contenção do sticky). O espaçador não pode ser uma margem da coluna: o
 * navegador desconta a margem do quanto o sticky pode subir.
 *
 * `offset` é a folga, em px, até as bordas da área visível.
 */
export function useStickySidebar(
	asideRef: RefObject<HTMLElement | null>,
	spacerRef: RefObject<HTMLElement | null>,
	offset: number,
) {
	useEffect(() => {
		const aside = asideRef.current;
		const spacer = spacerRef.current;
		const scrollParent = aside ? getScrollParent(aside) : null;

		if (!aside || !spacer || !scrollParent) return;

		let spacerHeight = 0;

		const setSpacerHeight = (height: number) => {
			spacerHeight = height;
			spacer.style.height = height > 0 ? `${height}px` : "";
		};

		const update = () => {
			const visibleHeight = scrollParent.clientHeight;
			const height = aside.offsetHeight;

			// Cabe inteira (ou está escondida): presa em cima, como um sticky comum
			if (height + offset * 2 <= visibleHeight) {
				aside.style.top = `${offset}px`;
				aside.style.bottom = "";
				setSpacerHeight(0);
				return;
			}

			// top: o fim encosta na folga de baixo; bottom: o começo encosta na folga de cima
			const overflow = visibleHeight - height - offset;

			aside.style.top = `${overflow}px`;
			aside.style.bottom = `${overflow}px`;

			// Onde a coluna estaria sem o sticky (logo abaixo do espaçador) e onde ela está
			const naturalTop = spacer.getBoundingClientRect().bottom;
			const renderedTop = aside.getBoundingClientRect().top;

			// Diferença entre as duas só existe com a coluna presa
			if (Math.abs(renderedTop - naturalTop) > 0.5) {
				setSpacerHeight(Math.max(0, spacerHeight + renderedTop - naturalTop));
			}
		};

		update();

		scrollParent.addEventListener("scroll", update, { passive: true });

		// "Mostrar mais", imagens carregando e redimensionamento da janela
		const observer = new ResizeObserver(update);
		observer.observe(aside);
		observer.observe(scrollParent);

		return () => {
			scrollParent.removeEventListener("scroll", update);
			observer.disconnect();

			aside.style.top = "";
			aside.style.bottom = "";
			spacer.style.height = "";
		};
	}, [asideRef, spacerRef, offset]);
}
