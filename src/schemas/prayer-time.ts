import { z } from "zod";

export const PrayerTimeInMonthSchema = z
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
				}),
			),
		}),
	})
	.transform((v) => v.data.jadwal);

export type IPrayerTimeInMonth = z.infer<typeof PrayerTimeInMonthSchema>;
