import fs from "fs/promises";
import path from "path";

/**
 * Plugin React Mount — auto import React, ReactDOM and mount to #root
 * + auto inject CSS imports jadi <link rel="stylesheet" href="...">
 */
export const pluginReactMount = () => ({
	name: "gaman:react-mount",
	setup(build) {
		build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
			let source = await fs.readFile(args.path, "utf8");
			const filename = path.basename(args.path);

			// search all import CSS
			const cssImports = Array.from(source.matchAll(/import\s+["'](.+\.(css|scss|sass))["'];?/g))
				.map((m) => m[1]);

			// delete line import CSS from source
			source = source.replace(/import\s+["'](.+\.(css|scss|sass))["'];?/g, "");

			// create tag link for as CSS import
			const cssLinks = cssImports
				.map((cssPath) => {
					// calculate path absolute relatif to /_gaman/ui
					let relPath = path.relative(
						path.resolve("src/ui"),
						path.resolve(path.dirname(args.path), cssPath)
					);

					// change separator to /
					relPath = relPath.replace(/\\/g, "/");
					
					relPath = relPath.replace(/\.(scss|sass)$/, ".css");

					return `<link rel="stylesheet" href="/_gaman/ui/${relPath}">`;
				})
				.join("\n");

			// Inject React + mount logic
			const injected = `
import * as React from "react";
import * as ReactDOM from "react-dom/client";

${source}

if (typeof document !== "undefined") {
  // Inject CSS link to head
  const cssMarkup = \`${cssLinks}\`;
  document.head.insertAdjacentHTML("beforeend", cssMarkup);

  const root = document.getElementById("root");
  if (!root) throw new Error("No root element found for ${filename}");
  
  const propsEl = document.getElementById("__GAMAN_DATA__");
  const props = propsEl ? JSON.parse(propsEl.textContent) : {};

  import("${path.resolve(args.path)}").then((mod) => {
    const Component = mod.default || mod;
    ReactDOM.createRoot(root).render(React.createElement(Component, props));
  });
}
`;

			return {
				contents: injected,
				loader: "tsx",
			};
		});
	},
});
