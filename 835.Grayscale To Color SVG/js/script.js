const canvas = document.getElementById("imageCanvas");
const ctx = canvas.getContext("2d");
const sliders = {
	r: [
		document.getElementById("r0"),
		document.getElementById("r1"),
		document.getElementById("r2")
	],
	g: [
		document.getElementById("g0"),
		document.getElementById("g1"),
		document.getElementById("g2")
	],
	b: [
		document.getElementById("b0"),
		document.getElementById("b1"),
		document.getElementById("b2")
	]
};
const filterCodeTextarea = document.getElementById("filterCode");

const imageUrl = "https://assets.codepen.io/2045658/man-jogging-bw.jpeg";
let originalImage = new Image();
originalImage.crossOrigin = "Anonymous";

// Load image from URL and process it
originalImage.src = imageUrl;
originalImage.onload = () => {
	canvas.width = originalImage.width;
	canvas.height = originalImage.height;
	ctx.drawImage(originalImage, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
		data[i] = gray;
		data[i + 1] = gray;
		data[i + 2] = gray;
	}
	ctx.putImageData(imageData, 0, 0);
	applyFilter();
};

// Update filter and textarea when sliders change
Object.values(sliders)
	.flat()
	.forEach((slider) => {
		slider.addEventListener("input", applyFilter);
	});

function applyFilter() {
	const rValues = sliders.r.map((s) => s.value).join(" ");
	const gValues = sliders.g.map((s) => s.value).join(" ");
	bValues = sliders.b.map((s) => s.value).join(" ");

	const filter = document.getElementById("colorize");
	filter.querySelector("feFuncR").setAttribute("tableValues", rValues);
	filter.querySelector("feFuncG").setAttribute("tableValues", gValues);
	filter.querySelector("feFuncB").setAttribute("tableValues", bValues);

	// Update textarea with current filter code
	filterCodeTextarea.value = `
<filter id="colorize">
    <feComponentTransfer>
        <feFuncR type="table" tableValues="${rValues}"/>
        <feFuncG type="table" tableValues="${gValues}"/>
        <feFuncB type="table" tableValues="${bValues}"/>
    </feComponentTransfer>
</filter>`.trim();

	canvas.style.filter = "url(#colorize)";
}