const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const secondHand = document.getElementById("second-hand");
const timeEl = document.getElementById("halloween-clock");
const clockEl = document.querySelector(".clock");
const markers = document.querySelectorAll(".marker");

const daysRing = document.getElementById("days-ring");
const hoursRing = document.getElementById("hours-ring");
const minutesRing = document.getElementById("minutes-ring");
const secondsRing = document.getElementById("seconds-ring");
const daysValue = document.getElementById("days-value");
const hoursValue = document.getElementById("hours-value");
const minutesValue = document.getElementById("minutes-value");
const secondsValue = document.getElementById("seconds-value");

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function getTimeInUserZone() {
	const s = new Date().toLocaleString("en-US", { timeZone: userTimeZone });
	return new Date(s);
}
function getNextHalloween(now) {
	let y = now.getFullYear();
	let t = new Date(`${y}-10-31T00:00:00`);
	t = new Date(t.toLocaleString("en-US", { timeZone: userTimeZone }));
	if (now >= t) {
		y += 1;
		t = new Date(`${y}-10-31T00:00:00`);
		t = new Date(t.toLocaleString("en-US", { timeZone: userTimeZone }));
	}
	return t;
}

let maxDays = null;

function updateClock() {
	const now = getTimeInUserZone();
	const h = now.getHours() % 12,
		m = now.getMinutes(),
		s = now.getSeconds(),
		ms = now.getMilliseconds();
	const secDeg = ((s + ms / 1000) / 60) * 360;
	const minDeg = ((m + s / 60) / 60) * 360;
	const hourDeg = ((h + m / 60 + s / 3600) / 12) * 360;
	hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
	minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
	secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
	timeEl.dateTime = now.toISOString();
}

function positionMarkers() {
	const rect = clockEl.getBoundingClientRect();
	const d = Math.min(rect.width, rect.height);
	const r = d * 0.42;
	markers.forEach((el) => {
		const idx = parseInt(el.dataset.index, 10);
		const ang = (idx / 12) * 2 * Math.PI;
		const x = rect.width / 2 + r * Math.cos(ang - Math.PI / 2);
		const y = rect.height / 2 + r * Math.sin(ang - Math.PI / 2);
		el.style.left = `${x}px`;
		el.style.top = `${y}px`;
	});
}

function updateCountdown() {
	const now = getTimeInUserZone();
	const target = getNextHalloween(now);
	let diff = target - now;
	if (diff < 0) diff = 0;

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
	const minutes = Math.floor((diff / (1000 * 60)) % 60);
	const seconds = Math.floor((diff / 1000) % 60);

	daysValue.textContent = String(days).padStart(2, "0");
	hoursValue.textContent = String(hours).padStart(2, "0");
	minutesValue.textContent = String(minutes).padStart(2, "0");
	secondsValue.textContent = String(seconds).padStart(2, "0");

	if (maxDays === null) maxDays = days || 1;
	const daysProg = (days / maxDays) * 360;
	const hoursProg = (hours / 24) * 360;
	const minutesProg = (minutes / 60) * 360;
	const secondsProg = (seconds / 60) * 360;

	daysRing.style.setProperty("--value", `${daysProg}deg`);
	hoursRing.style.setProperty("--value", `${hoursProg}deg`);
	minutesRing.style.setProperty("--value", `${minutesProg}deg`);
	secondsRing.style.setProperty("--value", `${secondsProg}deg`);
}

function fitToViewport() {
	document.documentElement.style.setProperty(
		"--clock-size",
		`min(70vmin,55dvh,520px)`
	);
}

fitToViewport();
updateClock();
positionMarkers();
updateCountdown();
setInterval(() => {
	updateClock();
	updateCountdown();
}, 1000);
window.addEventListener("resize", () => {
	fitToViewport();
	positionMarkers();
});