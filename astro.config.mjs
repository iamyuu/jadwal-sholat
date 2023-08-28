import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import pwa from "@vite-pwa/astro";
import { manifest } from "./src/constants";

// https://astro.build/config
export default defineConfig({
	output: "hybrid",
	site: "https://jadwalsholat.my.id",
	integrations: [
		tailwind(),
		svelte(),
		sitemap(),
		pwa({
			mode: "production",
			base: "/",
			scope: "/",
			includeAssets: ["**/icons/*.{png,svg,ico,xml}"],
			strategies: "injectManifest",
			srcDir: "src",
			filename: "sw.ts",
			manifest,
			workbox: {
				navigateFallback: "/404",
				globPatterns: ["**/*.{css,js,html,svg,png,ico}"],
			},
			devOptions: {
				enabled: true,
				navigateFallbackAllowlist: [/^\/404$/],
			},
		}),
	],
	adapter: cloudflare(),
});
