const SERVICE_URL = "https://api.myquran.com/v1/sholat/jadwal";
const fallbackTimezone = "Asia/Jakarta";
const fallbackPrayer = "subuh";

/**
 * Get next prayer time for specific city
 */
export async function getNextPrayerTime(cityId: string, cf?: unknown) {
	const prayerTime = await getPrayerTime(cityId);

	// Get current hour based on user's timezone
	const currentTime = new Intl.DateTimeFormat("id-ID", {
		hour: "numeric",
		minute: "numeric",
		timeZone: cf?.timezone || fallbackTimezone,
	}).format(new Date());

	// Find next prayer time
	function finderNextPrayer(key: string) {
		try {
			const [currentHour, currentMinute] = currentTime.split(".");
			const [hour, minute] = prayerTime[key].split(":");

			if (parseInt(hour) > parseInt(currentHour)) {
				return true;
			}

			if (parseInt(hour) === parseInt(currentHour)) {
				return parseInt(minute) >= parseInt(currentMinute);
			}

			return false;
		} catch {
			return false;
		}
	}

	// Get next prayer time
	// TODO: should fetch next day prayer time if no next prayer time found
	const findNextPrayer = Object.keys(prayerTime).find(finderNextPrayer);
	const nextPrayerName = findNextPrayer ?? fallbackPrayer;

	return {
		name: nextPrayerName,
		time: prayerTime[nextPrayerName],
		isNextDay: !findNextPrayer,
	};
}

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
