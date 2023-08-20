<script>
	import { onMount } from 'svelte';

	/**
	 * @type {string} prayer time in hours:minutes
	 */
	export let prayerTime = '';

	// Transform prayer time to Date object
	const now = new Date();
	const [prayerHour, prayerMinute] = prayerTime.split(':');
	const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), prayerHour, prayerMinute);

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
	$: seconds = seconds < 10 ? `0${seconds}` : seconds;
	$: minutes = minutes < 10 ? `0${minutes}` : minutes;
	$: hours = hours < 10 ? `0${hours}` : hours;
</script>

<small class='text-md opacity-75'>
	{hours}j : {minutes}m : {seconds}d
</small>
