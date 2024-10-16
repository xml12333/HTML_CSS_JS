function getVariableCSS(name, source = document.documentElement) {
	return getComputedStyle(source).getPropertyValue(`--${name}`);
}

function setVariableCSS(name, value, source = document.documentElement) {
	return source.style.setProperty(`--${name}`, value);
}

function appendChildren(children, parent = document.body) {
	if (Array.isArray(children)) parent.append(...children);
	else parent.append(children);

	return parent;
}

function createElements(
	length,
	clone = document.createElement("div"),
	deep = true
) {
	return Array.from({ length }, () => clone.cloneNode(deep));
}

function createElement(className, tag = "div") {
	const element = document.createElement(tag);

	if (className) element.className = className;

	return element;
}

function setupScene(node) {
	const scene = appendChildren(node, createElement("scene"));

	appendChildren(scene);

	return scene;
}

function createCube() {
	return appendChildren(
		createElements(6, createElement("face")),
		createElement("cube")
	);
}

function createCubes(cubes = 0, cube = createCube()) {
	return appendChildren(
		createElements(cubes > 0 ? cubes : getVariableCSS("cubes"), cube),
		createElement("cubes")
	);
}