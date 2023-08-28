export const seo = {
	locale: "id",
	author: "Muhammad Yusuf",
	creator: "iamyuu027",
	title: "Jadwal Sholat",
	description:
		"⏰ Cek jadwal sholat berikutnya di kota Anda. Tanpa iklan, tanpa analitik, sepenuhnya gratis.",
	url: "",
	image: "og.png",
	imageAlt: "Aplikasi Jadwal Sholat",
	keywords: [
		"adzan",
		"waktu adzan",
		"waktu sholat",
		"jadwal sholat",
		"adzan terdekat",
		"adzan berikutnya",
		"adzan hari ini",
		"waktu adzan terdekat",
		"waktu adzan berikutnya",
		"waktu adzan hari ini",
		"waktu sholat terdekat",
		"waktu sholat berikutnya",
		"waktu sholat hari ini",
		"jadwal sholat terdekat",
		"jadwal sholat berikutnya",
		"jadwal sholat hari ini",
	].join(","),
};

export const manifest = {
	display: "standalone",
	id: "/?homescreen=1",
	start_url: "/?homescreen=1",
	scope: "/",
	name: seo.title,
	description: seo.description,
	theme_color: "hsl(175, 13%, 32%)", // color-paragpraph
	background_color: "hsl(156, 24%, 96%)", // color-background
	icons: [
		{ src: "/icons/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
		{ src: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
		{ src: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
		{
			src: "/icons/icon-512.png",
			type: "image/png",
			sizes: "512x512",
			purpose: "any maskable",
		},
	],
	shortcuts: [
		{ url: "/", name: "Jadwal Harian" },
		{ url: "/bulanan", name: "Jadwal Bulanan" },
	],
};
