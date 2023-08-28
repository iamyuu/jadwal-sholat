import type { CfProperties } from "@cloudflare/workers-types";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import { cachified, lruCacheAdapter, type CacheEntry } from "cachified";

const SERVICE_URL = "https://api.myquran.com/v1/sholat/jadwal";

const fallbackTimezone = "Asia/Jakarta";
const fallbackPrayer = "subuh";

const lru = new LRUCache<string, CacheEntry>({ max: 50 });
const cache = lruCacheAdapter(lru);
const cacheTtlMs = 1_000 * 60 * 60 * 24 * 31; // 1 month

const prayerTimeResponseSchema = z
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
	.transform((data) => data.data.jadwal);

/**
 * Get next prayer time for specific city
 */
export async function getNextPrayerTime(cityId: string, cf?: CfProperties) {
	// TODO: improve type
	const prayerTime = (await getPrayerTime(cityId)) as unknown as Record<
		string,
		string
	>;

	// Get current hour based on user's timezone
	const currentTime = new Intl.DateTimeFormat("id-ID", {
		hour: "numeric",
		minute: "numeric",
		timeZone:
			typeof cf?.timezone === "string" ? cf?.timezone : fallbackTimezone,
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

	return cachified<PrayerTime>({
		key: `ID_${cityId}-${currentYearAndMonth}`,
		cache,
		ttl: cacheTtlMs,
		async getFreshValue() {
			const response = await fetch(
				`${SERVICE_URL}/${cityId}/${currentYearAndMonth}`
			).then((r) => r.json());

			return prayerTimeResponseSchema.parse(response);
		},
	});
}

type PrayerTime = z.infer<typeof prayerTimeResponseSchema>;
