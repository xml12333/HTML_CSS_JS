const ingredients = [
	"lamb",
	"beef",
	"chicken",
	"salmon",
	"pepper",
	"onion",
	"falafel",
	"tofu",
	"tomato",
	"mushroom",
	"zucchini",
	"eggplant"
];

const container = document.getElementsByClassName("ingredients")[0];
const skewer = document.getElementsByClassName("skewer")[0];
const coal = document.getElementsByClassName("coal")[0];
const trashbox = document.getElementsByClassName("trashbox")[0];
let foodItems = [];
let grillSkewers = [];

ingredients.forEach((ingredient) => {
	const div = document.createElement("div");
	div.id = ingredient;
	div.className = "container " + ingredient + "-pile";
	div.addEventListener("click", () => addFoodItem(ingredient));
	container.appendChild(div);
});

document.addEventListener("mousemove", (e) => {
	let rect = document.body.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	skewer.style.left = `${x}px`;
	skewer.style.top = `${y}px`;
});

function addFoodItem(name) {
	const totalHeight = foodItems.reduce(
		(sum, item) => sum + getItemHeight(item),
		0
	);
	if (totalHeight >= 24) return;

	const foodItem = document.createElement("div");
	foodItem.className = `food-item ${name}`;
	const itemHeight = getItemHeight(name);
	const baseOffset = 8;
	foodItem.style.bottom = `${baseOffset + totalHeight}vmin`;
	foodItem.style.left = "50%";
	foodItem.style.transform = "translateX(-50%)";
	skewer.appendChild(foodItem);
	foodItems.push(name);
}

function getItemHeight(name) {
	switch (name) {
		case "falafel":
			return 4;
		case "eggplant":
			return 2;
		case "zucchini":
			return 2;
		case "mushroom":
			return 2;
		case "onion":
			return 2;
		case "pepper":
			return 2;
		default:
			return 3;
	}
}

coal.addEventListener("click", () => {
	if (foodItems.length === 0 || grillSkewers.length >= 4) return;

	const grillSkewer = document.createElement("div");
	grillSkewer.className = "grill-skewer";
	const position = 25 + grillSkewers.length * 10;
	grillSkewer.style.left = `${position}vmin`;
	coal.appendChild(grillSkewer);
	grillSkewers.push(grillSkewer);

	let totalHeight = 0;
	foodItems.forEach((name) => {
		const foodItem = document.createElement("div");
		foodItem.className = `food-item ${name}`;
		const itemHeight = getItemHeight(name);
		foodItem.style.bottom = `${8 + totalHeight}vmin`;
		foodItem.style.left = "50%";
		foodItem.style.transform = "translateX(-50%)";
		grillSkewer.appendChild(foodItem);
		totalHeight += itemHeight;
	});

	skewer.innerHTML = "";
	foodItems = [];
});

trashbox.addEventListener("click", () => {
	skewer.innerHTML = "";
	foodItems = [];
});