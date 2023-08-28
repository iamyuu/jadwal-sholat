import { registerSW } from "virtual:pwa-register";

window.addEventListener("load", () => {
	const pwaToast = document.querySelector<HTMLDivElement>("#pwa-toast")!;
	const pwaToastMessage = pwaToast.querySelector<HTMLDivElement>(
		".message #toast-message"
	)!;
	const pwaCloseBtn = pwaToast.querySelector<HTMLButtonElement>("#pwa-close")!;
	const pwaRefreshBtn =
		pwaToast.querySelector<HTMLButtonElement>("#pwa-refresh")!;

	let refreshSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

	const refreshCallback = () => refreshSW?.(true);

	function hideToast(raf = false) {
		if (raf) {
			requestAnimationFrame(() => hideToast(false));
			return;
		}

		if (pwaToast.classList.contains("refresh")) {
			pwaRefreshBtn.removeEventListener("click", refreshCallback);
		}

		pwaToast.classList.remove("show", "refresh");
	}

	function showToast(offline: boolean) {
		if (!offline) {
			pwaRefreshBtn.addEventListener("click", refreshCallback);
		}

		requestAnimationFrame(() => {
			hideToast(false);

			if (!offline) {
				pwaToast.classList.add("refresh");
			}

			pwaToast.classList.add("show");
		});
	}

	pwaCloseBtn.addEventListener("click", () => hideToast(true));

	refreshSW = registerSW({
		immediate: true,
		onOfflineReady() {
			pwaToastMessage.innerHTML =
				"Aplikasi ini sudah dapat digunakan secara offline";
			showToast(true);
		},
		onNeedRefresh() {
			pwaToastMessage.innerHTML =
				"Versi terbaru sudah tersedia, klik tombol refresh untuk memperbarui";
			showToast(false);
		},
	});
});
