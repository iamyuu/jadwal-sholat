<script lang="ts">
	import { onMount } from 'svelte';

	// prayer time in hours:minutes
	export let prayerTime: string;
	export let isNextDay: boolean;

	// Transform prayer time to Date object
	const now = new Date();
	const [prayerHour, prayerMinute] = prayerTime.split(':');
	const prayerDate = new Date();
	prayerDate.setHours(Number(prayerHour), Number(prayerMinute), 0, 0);
	if (isNextDay) prayerDate.setDate(now.getDate() + 1);

	// Calculate remaining time
	let seconds = Math.floor((prayerDate - now) / 1000);
	let minutes = Math.floor(seconds / 60);
	let hours = Math.floor(minutes / 60);

	// Format remaining time
	seconds = seconds % 60;
	minutes = minutes % 60;
	hours = hours % 24;

	onMount(() => {
		// Update remaining time every second
		const interval = setInterval(() => {
			seconds--;

			if (seconds < 0) {
				seconds = 59;
				minutes--;

				if (minutes < 0) {
					minutes = 59;
					hours--;

					if (hours < 0) {
						hours = 23;
					}
				}
			}
		}, 1000);

		// Clear interval on component unmount
		return () => clearInterval(interval);
	});

	// Add leading zero to single digit numbers
	// or return '--' if time is NaN or less than 1
	function formatTime(time: number) {
		if (isNaN(time) || time < 0) return '--';
		return time < 10 ? `0${time}` : time;
	}
</script>

<small>
	{formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
</small>
