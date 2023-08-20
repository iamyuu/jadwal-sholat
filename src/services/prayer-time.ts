const SERVICE_URL = "https://api.myquran.com/v1/sholat/jadwal";

/**
 * Get prayer time for specific city
 */
export async function getPrayerTime(cityId: string) {
	const now = new Date();
	const response = await fetch(
		[
			SERVICE_URL,
			cityId,
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate(),
		].join("/")
	).then((r) => r.json());

	return transformResponse(response);
}

/**
 * Transform response from API to get specific data
 */
function transformResponse(
	response: PrayerTimeResponse
): Record<string, string> {
	const jadwal = response.data.jadwal;

	return {
		subuh: jadwal.subuh,
		dzuhur: jadwal.dzuhur,
		ashar: jadwal.ashar,
		maghrib: jadwal.maghrib,
		isya: jadwal.isya,
	};
}

interface PrayerTimeResponse {
	data: {
		jadwal: {
			imsak: string;
			subuh: string;
			terbit: string;
			dhuha: string;
			dzuhur: string;
			ashar: string;
			maghrib: string;
			isya: string;

			date: string;
			tanggal: string;
		};
	};
}

// shubuh
// zhuhur
// ashar
// magrib
// isya
