import fs from 'fs/promises';
import path from 'path';
/**
 * Plugin React Mount — auto import React, ReactDOM and mount to #root
 */
export const pluginReactMount = () => ({
	name: 'gaman:react-mount',
	setup(build) {
		build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
			const source = await fs.readFile(args.path, 'utf8');
			const filename = path.basename(args.path);

			const injected = `
import * as React from "react";
import * as ReactDOM from "react-dom/client";

${source}

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (!root) throw new Error("No root element found for ${filename}");
  
  // ambil properti dari server gaman
  const props = window.__GAMAN_DATA__ || {};

  // ambil komponen default dari modul ini (ESM)
  import("${path.resolve(args.path)}").then((mod) => {
    const Component = mod.default || mod;
    ReactDOM.createRoot(root).render(React.createElement(Component, props));
  });
}
`;

			return {
				contents: injected,
				loader: 'tsx',
			};
		});
	},
});
