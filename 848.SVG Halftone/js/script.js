"use strict";
const preview = document.getElementById("preview");
const upload = document.getElementById("upload");
const color = document.getElementById("color");
const filterSelect = document.getElementById("filter-select");
upload.addEventListener("input", e => {
    const file = e.target.files[0];
    if (!file)
        return;
    preview.src = URL.createObjectURL(file);
});
color.addEventListener("input", e => {
    const val = color.value;
    flood.setAttribute('flood-color', val);
    floodHd.setAttribute('flood-color', val);
});
filterSelect.addEventListener("change", setFilter);
function setFilter() {
    const val = filterSelect.value;
    preview.style.filter = val ? `url(#${val})` : "none";
}
setFilter();