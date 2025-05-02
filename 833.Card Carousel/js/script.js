const colors = [
	"#FF0000",
	"#FF7F00",
	"#FFFF00",
	"#00FF00",
	"#0000FF",
	"#4B0082",
	"#9400D3"
];
const track = document.getElementById("track");
const tabs = document.getElementById("tabs");
let activeIndex = 0;

function createCarousel() {
	colors.forEach((color, index) => {
		const card = document.createElement("div");
		card.className = "card";
		//card.innerHTML = `<div class="card-content" style="background:${color}">Card ${index + 1}</div>`;
		card.innerHTML = `<div class="card-content" style="background: url('https://picsum.photos/800/600?random=${index}') center/cover no-repeat;"></div>`;
		track.appendChild(card);

		const tab = document.createElement("button");
		tab.className = "tab";
		tab.textContent = `${index + 1}`;
		tab.onclick = () => scrollToCard(index);
		tabs.appendChild(tab);
	});

	updateTabs();
}

function scrollToCard(index) {
	const count = colors.length;
	activeIndex = (index + count) % count;
	track.style.transform = `translateY(-${activeIndex * 400}px)`;
	updateTabs();
}

function updateTabs() {
	[...tabs.children].forEach((tab, i) => {
		tab.classList.toggle("active", i === activeIndex);
	});
}

createCarousel();