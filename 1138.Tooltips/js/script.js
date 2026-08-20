document.addEventListener("click", (e) => {
	if (!e.target.closest("[data-tip]")) {
		document.activeElement.blur();
	}
});