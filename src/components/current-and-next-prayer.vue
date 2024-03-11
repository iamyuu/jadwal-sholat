<script setup lang="ts">
import { ref } from "vue";
import {
	getCurrentAndNextPrayerTime,
	type PrayerTime,
} from "../services/prayer-time";
import { addLeadingZero } from "../utils/misc";

const props = defineProps<{
	timeZone: string;
	prayerTime: PrayerTime;
}>();

const countdownNextPrayer = ref("--:--:--");

// find prayer time
const { currentPrayerTime: currentPrayerName, nextPrayerTime: nextPrayerName } =
	getCurrentAndNextPrayerTime(props.prayerTime);

const currentPrayerTime = props.prayerTime[currentPrayerName];
const currentPrayerIcon = `/sprite.svg#${currentPrayerName}`;

const nextPrayerTime = props.prayerTime[nextPrayerName];

const [nextPrayerHour, nextPrayerMinute] = nextPrayerTime.split(":");
const nextPrayerDate = new Date();

// set hours and minutes to next prayer time
nextPrayerDate.setHours(parseInt(nextPrayerHour), parseInt(nextPrayerMinute));

// if there's no next prayer, then set next prayer date to tomorrow
if (!nextPrayerName) {
	nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
}

// start timer
let timer = setInterval(() => {
	// find difference between next prayer date and now
	const diff = Math.abs(nextPrayerDate.getTime() - Date.now());

	if (diff <= 0) {
		// if diff is less than or equal to 0, then clear interval
		clearInterval(timer);
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
</script>

<template>
	<section class="flex items-center space-x-4 p-4 rounded-t-xl">
		<div class="bg-slate-50 p-2 rounded-xl">
			<svg width="48" height="48">
				<use :href="currentPrayerIcon"></use>
			</svg>
		</div>

		<div class="w-full space-y-1">
			<h1 class="text-highlight text-lg capitalize" aria-label="sholat sekarang">
				{{ currentPrayerName }}
			</h1>

			<div class="flex justify-between">
				<time
					class="font-semibold text-heading text-4xl"
					:dateTime="currentPrayerTime"
				>
					{{ currentPrayerTime }}
				</time>

				<div class="flex flex-col text-right text-sm">
					<small class="capitalize font-medium" aria-label="sholat selanjutnya">
						{{ nextPrayerName }}
					</small>
					<span aria-label="waktu sholat selanjutnya" class="sr-only">{{ nextPrayerTime }}</span>
					<span class="font-light">{{ countdownNextPrayer }}</span>
				</div>
			</div>
		</div>
	</section>
</template>
