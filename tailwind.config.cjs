/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				background: 'var(--color-background)',
				card: 'var(--color-card)',
				heading: 'var(--color-heading)',
				paragpraph: 'var(--color-paragpraph)',
				highlight: 'var(--color-highlight)',
			},
		},
	},
	plugins: [],
}
