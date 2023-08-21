import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
	output: "hybrid",
	site: "https://jadwalsholat.my.id",
	integrations: [tailwind(), svelte(), sitemap()],
	adapter: cloudflare(),
});
