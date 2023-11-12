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
export function getCurrentAndNextPrayerTime(
	prayerTime: PrayerTime,
	timeZone?: string
) {
	const prayerTimeKeys = Object.keys(prayerTime) as Array<keyof PrayerTime>;
	const currentTime = new Intl.DateTimeFormat("id-ID", {
		hour: "numeric",
		minute: "numeric",
		timeZone,
	}).format(new Date());

	// set default to last prayer time
	let currentPrayerTime: keyof PrayerTime = "isya";

	// find current prayer time
	for (const prayerName of prayerTimeKeys) {
		const time = prayerTime[prayerName];

		// if time is not string (should be HH:mm), then it's not valid to compare, just continue
		if (typeof time !== "string") {
			continue;
		}

		try {
			// current time has format: 12.00, because we use Intl.DateTimeFormat
			const [currentHour, currentMinute] = currentTime.split(".");
			// prayer time has format: 12:00, it's external data
			const [hour, minute] = time.split(":");

			// if current time is less than prayer time, then it's current prayer time
			if (
				Number(currentHour) < Number(hour) ||
				(Number(currentHour) === Number(hour) &&
					Number(currentMinute) < Number(minute))
			) {
				currentPrayerTime = prayerName;
				break;
			}

			// if current time is greater than prayer time, then it's not current prayer time
			if (
				Number(currentHour) > Number(hour) ||
				(Number(currentHour) === Number(hour) &&
					Number(currentMinute) > Number(minute))
			) {
				continue;
			}

			// if current time is equal to prayer time, then it's current prayer time
			currentPrayerTime = prayerName;
			break;
		} catch {
			// if there's an error, just continue
			continue;
		}
	}

	const nextPrayerTimeIndex = prayerTimeKeys.indexOf(currentPrayerTime) + 1;

	return {
		currentPrayerTime,
		nextPrayerTime: prayerTimeKeys[nextPrayerTimeIndex],
	};
}

type PrayerTimeInMonth = z.infer<typeof schema>;
export type PrayerTime = Omit<PrayerTimeInMonth[number], "date">;
