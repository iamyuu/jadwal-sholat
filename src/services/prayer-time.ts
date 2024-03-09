import { cachified } from "@epic-web/cachified";
import {
	type IPrayerTimeInMonth,
	PrayerTimeInMonthSchema,
} from "../schemas/prayer-time";
import { cache } from "../utils/cache";

const SERVICE_URL = "https://api.myquran.com/v2/sholat/jadwal";
const CACHE_TTL_MS = 1_000 * 60 * 60 * 24 * 31; // 1 month

class HttpError extends Error {}

/**
 * Get prayer time in a month for specific city
 */
export async function getPrayerTimeInMonth(cityId: string) {
	const now = new Date();
	const currentYearAndMonth = `${now.getFullYear()}/${now.getMonth() + 1}`;

	return cachified<IPrayerTimeInMonth>({
		key: `ID_${cityId}-${currentYearAndMonth}`, // prefix with country code, so it can be scaled globally
		cache,
		ttl: CACHE_TTL_MS,
		checkValue: PrayerTimeInMonthSchema,
		forceFresh: now.getDate() === 1, // force fresh value on first day of month
		async getFreshValue() {
			return fetch(`${SERVICE_URL}/${cityId}/${currentYearAndMonth}`).then(
				(r) => {
					if (!r.ok) {
						throw new HttpError("Failed to fetch data");
					}

					return r.json();
				},
			);
		},
	});
}

/**
 * Get prayer time in a day for specific city
 */
export async function getPrayerTime(cityId: string) {
	const prayerTimeInMonth = await getPrayerTimeInMonth(cityId);

	// subtract 1 because array index start from 0
	return prayerTimeInMonth[new Date().getDate() - 1];
}

/**
 * Get current and next prayer time, based on current time
 */
export function getCurrentAndNextPrayerTime(prayerTime: PrayerTime) {
	const prayerTimeKeys = Object.keys(prayerTime) as Array<keyof PrayerTime>;
	const today = new Date();

	// find current prayer time and if not found, set to last prayer time
	const currentPrayerTime =
		prayerTimeKeys
			.filter((key) => {
				const [prayerHour, prayerMinute] = prayerTime[key].split(":");
				const prayerTimeByKey = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate(),
					parseInt(prayerHour),
					parseInt(prayerMinute),
					0,
				);

				return prayerTimeByKey.getTime() <= today.getTime();
			})
			.pop() ?? prayerTimeKeys[prayerTimeKeys.length - 1];

	const nextPrayerTimeIndex = prayerTimeKeys.indexOf(currentPrayerTime) + 1;

	return {
		currentPrayerTime,
		nextPrayerTime: prayerTimeKeys[nextPrayerTimeIndex],
	};
}

export type PrayerTime = Omit<IPrayerTimeInMonth[number], "date">;
