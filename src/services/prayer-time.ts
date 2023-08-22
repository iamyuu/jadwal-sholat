import { LRUCache } from "lru-cache";
import { cachified, lruCacheAdapter, type CacheEntry } from "cachified";

const SERVICE_URL = "https://api.myquran.com/v1/sholat/jadwal";

const fallbackTimezone = "Asia/Jakarta";
const fallbackPrayer = "subuh";

const lru = new LRUCache<string, CacheEntry>({ max: 50 });
const cache = lruCacheAdapter(lru);
const cacheTtlMs = 1_000 * 60 * 60 * 24 * 31; // 1 month

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
	// TODO: it should wait at least 15 minute before switching to next prayer time
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
	const findNextPrayer = Object.keys(prayerTime).find(finderNextPrayer);
	// TODO: should fetch next day prayer time if no next prayer time found
	const nextPrayerName = findNextPrayer ?? fallbackPrayer;

	return {
		name: nextPrayerName,
		time: prayerTime[nextPrayerName],
		isNextDay: !findNextPrayer,
	};
}

/**
 * Get prayer time in a day for specific city
 */
export async function getPrayerTime(cityId: string) {
	const prayerTimeInMonth = await getPrayerTimeInMoth(cityId);

	return prayerTimeInMonth[new Date().getDate() - 1];
}

/**
 * Get prayer time in a month for specific city
 */
export async function getPrayerTimeInMoth(cityId: string) {
	const now = new Date();
	const currentYearAndMonth = `${now.getFullYear()}/${now.getMonth() + 1}`;

	return cachified<Array<PrayerTime>>({
		key: `ID_${cityId}-${currentYearAndMonth}`,
		cache,
		ttl: cacheTtlMs,
		async getFreshValue() {
			const response = await fetch(
				`${SERVICE_URL}/${cityId}/${currentYearAndMonth}`
			).then((r) => r.json());

			return transformResponse(response);
		},
	});
}

/**
 * Transform response from API to get specific data
 */
function transformResponse(response: PrayerTimeResponse): Array<PrayerTime> {
	const schedules = response.data.jadwal;

	return schedules.map((schedule) => ({
		subuh: schedule.subuh,
		dzuhur: schedule.dzuhur,
		ashar: schedule.ashar,
		maghrib: schedule.maghrib,
		isya: schedule.isya,
	}));
}

type PrayerTime = Record<string, string>;

interface PrayerTimeResponse {
	data: {
		jadwal: Array<{
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
		}>;
	};
}
