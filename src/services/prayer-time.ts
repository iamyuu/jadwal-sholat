import { z } from "zod";
import { LRUCache } from "lru-cache";
import { cachified, lruCacheAdapter, type CacheEntry } from "cachified";

const SERVICE_URL = "https://api.myquran.com/v1/sholat/jadwal";

const lru = new LRUCache<string, CacheEntry>({ max: 50 });
const cache = lruCacheAdapter(lru);
const cacheTtlMs = 1_000 * 60 * 60 * 24 * 31; // 1 month

const schema = z
	.object({
		data: z.object({
			jadwal: z.array(
				z.object({
					subuh: z.string(),
					dzuhur: z.string(),
					ashar: z.string(),
					maghrib: z.string(),
					isya: z.string(),
					date: z.coerce.date(),
				})
			),
		}),
	})
	.transform((v) => v.data.jadwal);

/**
 * Get prayer time in a month for specific city
 */
export async function getPrayerTimeInMonth(cityId: string) {
	const now = new Date();
	const currentYearAndMonth = `${now.getFullYear()}/${now.getMonth() + 1}`;

	return cachified<PrayerTimeInMonth>({
		key: `ID_${cityId}-${currentYearAndMonth}`, // prefix with country code, so it can be scaled globally
		cache,
		ttl: cacheTtlMs,
		checkValue: schema,
		forceFresh: now.getDate() === 1, // force fresh value on first day of month
		async getFreshValue() {
			return fetch(`${SERVICE_URL}/${cityId}/${currentYearAndMonth}`).then(
				(r) => r.json()
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
					0
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

type PrayerTimeInMonth = z.infer<typeof schema>;
export type PrayerTime = Omit<PrayerTimeInMonth[number], "date">;
