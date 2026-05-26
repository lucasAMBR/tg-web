import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { routeTree } from "./route-tree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import "./i18n";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<React.Suspense fallback={<div>Loading...</div>}>
				<RouterProvider router={router} />
			</React.Suspense>
		</StrictMode>,
	);
}
