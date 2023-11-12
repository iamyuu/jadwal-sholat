import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
	getCurrentAndNextPrayerTime,
	type PrayerTime,
} from "../services/prayer-time";
import { addLeadingZero } from "../utils/misc";

type CurrentAndNextPrayerProps = {
	timeZone: string;
	prayerTime: PrayerTime;
};

export const CurrentAndNextPrayer = component$<CurrentAndNextPrayerProps>(
	// @ts-expect-error
	({ props }) => {
		const currentPrayerTime = useSignal({
			name: "--",
			time: "--:--",
			icon: "/sprite.svg#tabler-question-mark",
		});
		const nextPrayerTime = useSignal({
			name: "--",
			time: "--:--",
		});
		const countdownNextPrayer = useSignal("--:--:--");

		useVisibleTask$(({ cleanup }) => {
			// find prayer time
			const finderPrayerTime = getCurrentAndNextPrayerTime(
				props.prayerTime,
				props.timeZone
			);

			const currentPrayerName = finderPrayerTime?.currentPrayerTime || "subuh";
			currentPrayerTime.value = {
				name: currentPrayerName,
				time: props.prayerTime[currentPrayerName],
				icon: `/sprite.svg#${currentPrayerName}`,
			};

			const nextPrayerName = finderPrayerTime?.nextPrayerTime || "subuh";
			const nextPrayerValue = props.prayerTime[nextPrayerName];
			nextPrayerTime.value = {
				name: nextPrayerName,
				time: nextPrayerValue,
			};

			const [nextPrayerHour, nextPrayerMinute] = nextPrayerValue.split(":");
			const nextPrayerDate = new Date();

			// set hours and minutes to next prayer time
			nextPrayerDate.setHours(nextPrayerHour, nextPrayerMinute);

			if (!finderPrayerTime.nextPrayerTime) {
				// if there's no next prayer, then set next prayer date to tomorrow
				nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
			}

			// set countdown timer
			const timerId = setInterval(() => {
				// find difference between next prayer date and now
				const diff = Math.abs(nextPrayerDate.getTime() - Date.now());

				if (diff <= 0) {
					// if diff is less than or equal to 0, then clear interval
					clearInterval(timerId);
					return;
				}

				// calculate hours, minutes, and seconds
				const hours = Math.floor(diff / 1000 / 60 / 60);
				const minutes = Math.floor(diff / 1000 / 60) % 60;
				const seconds = Math.floor(diff / 1000) % 60;

				countdownNextPrayer.value = [
					addLeadingZero(hours),
					addLeadingZero(minutes),
					addLeadingZero(seconds),
				].join(":");
			}, 1_000);

			cleanup(() => clearInterval(timerId));
		});

		return (
			<section class="flex items-center space-x-4 p-4 rounded-t-xl">
				<div class="bg-slate-50 p-2 rounded-xl">
					<svg width="48" height="48">
						<use href={currentPrayerTime.value.icon}></use>
					</svg>
				</div>

				<div class="w-full space-y-1">
					<h1 class="text-highlight text-lg capitalize">
						{currentPrayerTime.value.name}
					</h1>

					<div class="flex justify-between">
						<time
							class="font-semibold text-heading text-4xl"
							dateTime={currentPrayerTime.value.time}
						>
							{currentPrayerTime.value.time}
						</time>

						<div class="flex flex-col text-right text-sm">
							<small class="capitalize font-medium">
								{nextPrayerTime.value.name}
							</small>
							<span class="font-light">{countdownNextPrayer}</span>
						</div>
					</div>
				</div>
			</section>
		);
	}
);
