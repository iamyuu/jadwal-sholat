import type { APIRoute } from "astro";
import { getCityByUser } from "../../services/city";
import {
	getCurrentAndNextPrayerTime,
	getPrayerTime,
} from "../../services/prayer-time";

export const GET: APIRoute = async (ctx) => {
	// @ts-expect-error -- `cf` only available on Cloudflare, not on local dev
	const cf = ctx.locals.runtime?.cf;
	const userCity = getCityByUser(cf);

	// Get prayer time based on user's city (based on Cloudflare geolocation)
	const prayerTime = await getPrayerTime(userCity.id);
	// parse the prayer time to get the current and next prayer time
	const { currentPrayerTime, nextPrayerTime } =
		getCurrentAndNextPrayerTime(prayerTime);

	const formattedPrayerTime = {
		current: {
			name: currentPrayerTime,
			time: prayerTime[currentPrayerTime],
		},
		next: {
			name: nextPrayerTime,
			time: prayerTime[nextPrayerTime],
		},
	};

	return new Response(JSON.stringify(formattedPrayerTime), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
};
