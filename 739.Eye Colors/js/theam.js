const CSS_VARIABLES = ["background", "stroke", "fill", "hover"];

const OTHER_THEMES = createThemes([
	["222831", "393E46", "00ADB5", "EEEEEE"],
	["071952", "0B666A", "35A29F", "97FEED"],
	["8C3333", "557A46", "7A9D54", "F2EE9D"],
	["1D5D9B", "F4D160", "75C2F6", "FBEEAC"],
	["331D2C", "3F2E3E", "A78295", "EFE1D1"],
	["1D5B79", "468B97", "EF6262", "F3AA60"],
	["6527BE", "9681EB", "45CFDD", "A7EDE7"],
	["4C4B16", "898121", "E7B10A", "F7F1E5"],
	["3F2305", "61481c", "e6b325", "ffd95a"],
	["6A2C70", "B83B5E", "F08A5D", "F9ED69"],
	["252A34", "FF2E63", "08D9D6", "EAEAEA"],
	["252A34", "08D9D6", "FF2E63", "EAEAEA"],
	["252A34", "EAEAEA", "FF2E63", "08D9D6"],
	["424874", "DCD6F7", "A6B1E1", "F4EEFF"],
	["1B262C", "0F4C75", "3282B8", "BBE1FA"],
	["364F6B", "FC5185", "F5F5F5", "3FC1C9"],
	["364F6B", "3FC1C9", "F5F5F5", "FC5185"],
	["364F6B", "F5F5F5", "3FC1C9", "FC5185"],
	["212121", "323232", "0D7377", "14FFEC"],
	["2C3639", "3F4E4F", "A27B5C", "DCD7C9"],
	["2D4059", "EA5455", "F07B3F", "FFD460"],
	["3E4149", "444F5A", "FF9999", "FFC8C8"],
	["48466D", "3D84A8", "46CDCF", "ABEDD8"],
	["1E212D", "B68973", "EABF9F", "FAF3E0"],
	["850E35", "EE6983", "FFC4C4", "FFF5E4"],
	["40513B", "609966", "9DC08B", "EDF1D6"],
	["322653", "8062D6", "9288F8", "FFD2D7"],
	["461959", "7A316F", "CD6688", "AED8CC"],
	["3E001F", "982176", "F11A7B", "FFE5AD"]
]);

const THEMES = createThemes([
	["142d4c", "385170", "9fd3c7", "ececec"],
	["444444", "f30067", "00d1cd", "eaeaea"],
	["480032", "df0054", "ff8b6a", "ffd6c2"],
	["183661", "1c4b82", "dd6b4d", "dae1e7"],
	["113f67", "226597", "87c0cd", "f3f9fb"],
	["bd245f", "e44985", "f8b739", "f3dcad"],
	["1B2430", "62374e", "007880", "fdc57b"],
	["352961", "774181", "e6b2c6", "f6e5e5"],
	["1b1919", "616f39", "a7d129", "f8eeb4"],
	["070d59", "1f3c88", "5893d4", "f7b633"],
	["4c0045", "6f0765", "bd512f", "ffb228"],
	["240041", "900048", "ff4057", "ff8260"],
	["3c415e", "738598", "1cb3c8", "dfe2e2"],
	["283148", "913535", "bbbbbb", "e9eec9"],
	["33313b", "3c4f65", "834c69", "e6f5ff"],
	["0f0a3c", "07456f", "009f9d", "cdffeb"],
	["35234b", "5c3b6f", "d84c73", "ff8484"],
	["260c1a", "f05d23", "c5d86d", "f7f7f2"],
	["2c3848", "706381", "45b7b8", "f7de1c"],
	["2b2024", "a80038", "fd0054", "fbf9fa"],
	["373640", "63686e", "7e97a6", "b6f7c1"],
	["2c2828", "3b2c85", "219897", "85cfcb"],
	["5f1854", "8b104e", "1abb9c", "f7f7f7"],
	["440047", "fbecec", "e11d74", "91d18b"],
	["331D2C", "3F2E3E", "A78295", "EFE1D1"],
	["3F2305", "61481c", "e6b325", "ffd95a"],
	["070739", "D9FAFF", "3d6cb9", "ff6138"]
]);

const ALL_THEMES = THEMES.concat(OTHER_THEMES);

function createColor(color = "") {
	return color.startsWith("#") ? color : `#${color}`;
}

function createTheme([background, stroke, fill, hover] = []) {
	return {
		background: createColor(background),
		stroke: createColor(stroke),
		fill: createColor(fill),
		hover: createColor(hover)
	};
}

function createThemes(themes = THEMES) {
	return themes.map(createTheme);
}

function createSelection(themes, node) {
	const result = [];

	for (let index = 0; index < themes.length; index++) {
		const theme = themes[index];
		const clone = node.cloneNode(true);

		for (const [key, val] of Object.entries(theme))
			setVariableCSS(key, val, clone);

		result.push(clone);
	}

	return result;
}

function applyTheme(theme) {
	for (const CSS_VARIABLE of CSS_VARIABLES) {
		const cssVariable = `--${CSS_VARIABLE}`;

		document.documentElement.style.setProperty(cssVariable, theme[CSS_VARIABLE]);
	}
}

function applyThemeTarget(target) {
	const style = getComputedStyle(target);

	for (const CSS_VARIABLE of CSS_VARIABLES) {
		const cssVariable = `--${CSS_VARIABLE}`;

		document.documentElement.style.setProperty(
			cssVariable,
			style.getPropertyValue(cssVariable)
		);
	}
}

function selectTheme(event) {
	const { target } = event;

	if (target.tagName.toLowerCase() !== "button") return;

	applyThemeTarget(target);
}

function initiateTheme(themes, index = 0) {
	const { length } = themes;

	return applyTheme(
		themes[index < 0 ? 0 : index >= length ? length - 1 : index]
	);
}

function orientThemes(container) {
	const mediaOrientation = matchMedia("(orientation: portrait)");

	function updateOrientation() {
		const { matches } = mediaOrientation;

		container.classList.remove(matches ? "vertical" : "horizontal");
		container.classList.add(matches ? "horizontal" : "vertical");
	}

	mediaOrientation.addEventListener("change", updateOrientation);

	updateOrientation();

	return mediaOrientation;
}

function preventThemes() {
	// 	Prevent rendering for codepen previews
	if (document.body.getAttribute("onload") !== null) return true;
	// if (document.body.getAttribute("translate") !== "no") return false;
}

function setupThemes(themes = THEMES, { orientation } = {}) {
	const container = createElement("themes", "aside");
	const trigger = createElement("themes-trigger", "input");
	const select = createElement("themes-select", "button");
	const selects = createSelection(themes, select);
	const menu = createElement("themes-menu", "section");

	trigger.setAttribute("type", "checkbox");
	trigger.setAttribute("title", "show/hide themes");
	select.setAttribute("title", "select theme");
	menu.addEventListener("click", selectTheme);

	if (orientation !== undefined) container.classList.add(orientation);
	else orientThemes(container);

	return appendChildren(
		appendChildren([trigger, appendChildren(selects, menu)], container)
	);
}

function renderThemes({
	index,
	include = false,
	initiate = false,
	themes = THEMES,
	...options
} = {}) {
	if (index !== undefined || initiate)
		initiateTheme(include ? ALL_THEMES : themes, index);

	if (preventThemes()) return;

	window.addEventListener("DOMContentLoaded", () => {
		setupThemes(include ? ALL_THEMES : themes, options);
	});
}

// renderThemes();