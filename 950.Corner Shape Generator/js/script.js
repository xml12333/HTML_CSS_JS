console.clear()

// main selectors
const shape = document.getElementById("shape");
const displayCode = document.getElementById("display-code");
const btnCopyCode = document.getElementById("btn-copy-code");
const msgEl = document.getElementById("msg");

// ellipse sliders
const rangeCornerAll = document.getElementById("corner-ellipse");
const rangeCornerTL = document.getElementById("corner-ellipse-tl");
const rangeCornerTR = document.getElementById("corner-ellipse-tr");
const rangeCornerBR = document.getElementById("corner-ellipse-br");
const rangeCornerBL = document.getElementById("corner-ellipse-bl");

// radius sliders (first value)
const rangeRadiusAll = document.getElementById("corner-radius");
const rangeRadiusTL = document.getElementById("corner-radius-tl");
const rangeRadiusTR = document.getElementById("corner-radius-tr");
const rangeRadiusBR = document.getElementById("corner-radius-br");
const rangeRadiusBL = document.getElementById("corner-radius-bl");

// radius sliders (second value)
const rangeRadiusAll2 = document.getElementById("corner-radius-2");
const rangeRadiusTL2 = document.getElementById("corner-radius-tl-2");
const rangeRadiusTR2 = document.getElementById("corner-radius-tr-2");
const rangeRadiusBR2 = document.getElementById("corner-radius-br-2");
const rangeRadiusBL2 = document.getElementById("corner-radius-bl-2");

// link checkboxes for each corner's two radius sliders
const linkRadiusAllCheckbox = document.getElementById("link-radius");
const linkRadiusTLCheckbox = document.getElementById("link-radius-tl");
const linkRadiusTRCheckbox = document.getElementById("link-radius-tr");
const linkRadiusBRCheckbox = document.getElementById("link-radius-br");
const linkRadiusBLCheckbox = document.getElementById("link-radius-bl");

// update the shape style properties and sync sliders
function updateShapeFromSlider(source) {
    // ellipse sliders values
    let ellipseValues = {
        tl: rangeCornerTL ? parseFloat(rangeCornerTL.value) : 0,
        tr: rangeCornerTR ? parseFloat(rangeCornerTR.value) : 0,
        br: rangeCornerBR ? parseFloat(rangeCornerBR.value) : 0,
        bl: rangeCornerBL ? parseFloat(rangeCornerBL.value) : 0,
    };

    // global ellipse slider changed - update all corners
    if (source === rangeCornerAll) {
        const val = parseFloat(rangeCornerAll.value);
        [rangeCornerTL, rangeCornerTR, rangeCornerBR, rangeCornerBL].forEach(s => {
            if (s) s.value = val;
        });
        ellipseValues = { tl: val, tr: val, br: val, bl: val };
    }

    // individual ellipse slider changed - update only that corner value
    if ([rangeCornerTL, rangeCornerTR, rangeCornerBR, rangeCornerBL].includes(source)) {
        ellipseValues[source.id.split("-").pop()] = parseFloat(source.value);
    }

    // create corner-shape CSS property
    const ellipseArray = [ellipseValues.tl, ellipseValues.tr, ellipseValues.br, ellipseValues.bl];
    const allEqualEllipse = ellipseArray.every(v => v === ellipseArray[0]);
    let cornerShapeValue = "";

    if (allEqualEllipse) {
        cornerShapeValue = `superellipse(${ellipseArray[0]})`;
    } else {
        cornerShapeValue = ellipseArray.map(v => `superellipse(${v})`).join(" ");
    }

    // radius sliders
    let radius1Values = {
        tl: rangeRadiusTL ? parseFloat(rangeRadiusTL.value) : 0,
        tr: rangeRadiusTR ? parseFloat(rangeRadiusTR.value) : 0,
        br: rangeRadiusBR ? parseFloat(rangeRadiusBR.value) : 0,
        bl: rangeRadiusBL ? parseFloat(rangeRadiusBL.value) : 0,
    };

    let radius2Values = {
        tl: rangeRadiusTL2 ? parseFloat(rangeRadiusTL2.value) : 0,
        tr: rangeRadiusTR2 ? parseFloat(rangeRadiusTR2.value) : 0,
        br: rangeRadiusBR2 ? parseFloat(rangeRadiusBR2.value) : 0,
        bl: rangeRadiusBL2 ? parseFloat(rangeRadiusBL2.value) : 0,
    };

    // handle global radius sliders AND checkbox checked to update all others
    if (linkRadiusAllCheckbox?.checked) {
        if (source === rangeRadiusAll) {
            const val = parseFloat(rangeRadiusAll.value);
            // Update all individual radius1 sliders
            [rangeRadiusTL, rangeRadiusTR, rangeRadiusBR, rangeRadiusBL].forEach(s => { if (s) s.value = val; });
            // Update all individual radius2 sliders to same val
            [rangeRadiusTL2, rangeRadiusTR2, rangeRadiusBR2, rangeRadiusBL2].forEach(s => { if (s) s.value = val; });
            // Update other global slider to same val
            if (rangeRadiusAll2) rangeRadiusAll2.value = val;

            radius1Values = { tl: val, tr: val, br: val, bl: val };
            radius2Values = { tl: val, tr: val, br: val, bl: val };
        } else if (source === rangeRadiusAll2) {
            const val = parseFloat(rangeRadiusAll2.value);
            // Update all individual radius2 sliders
            [rangeRadiusTL2, rangeRadiusTR2, rangeRadiusBR2, rangeRadiusBL2].forEach(s => { if (s) s.value = val; });
            // Update all individual radius1 sliders to same val
            [rangeRadiusTL, rangeRadiusTR, rangeRadiusBR, rangeRadiusBL].forEach(s => { if (s) s.value = val; });
            // Update other global slider to same val
            if (rangeRadiusAll) rangeRadiusAll.value = val;

            radius1Values = { tl: val, tr: val, br: val, bl: val };
            radius2Values = { tl: val, tr: val, br: val, bl: val };
        }
    } else {
        // if NOT checked, handle global radius sliders individually
        if (source === rangeRadiusAll) {
            const val = parseFloat(rangeRadiusAll.value);
            [rangeRadiusTL, rangeRadiusTR, rangeRadiusBR, rangeRadiusBL].forEach(s => {
                if (s) s.value = val;
            });
            radius1Values = { tl: val, tr: val, br: val, bl: val };
        }
        if (source === rangeRadiusAll2) {
            const val2 = parseFloat(rangeRadiusAll2.value);
            [rangeRadiusTL2, rangeRadiusTR2, rangeRadiusBR2, rangeRadiusBL2].forEach(s => {
                if (s) s.value = val2;
            });
            radius2Values = { tl: val2, tr: val2, br: val2, bl: val2 };
        }
    }

    // handle individual radius slider syncing with linked checkboxes
    function syncRadius(corner) {
        if (corner === "tl") {
            radius1Values.tl = parseFloat(rangeRadiusTL.value);
            if (linkRadiusTLCheckbox?.checked) {
                radius2Values.tl = radius1Values.tl;
                if (rangeRadiusTL2) rangeRadiusTL2.value = radius1Values.tl;
            }
        }
        if (corner === "tr") {
            radius1Values.tr = parseFloat(rangeRadiusTR.value);
            if (linkRadiusTRCheckbox?.checked) {
                radius2Values.tr = radius1Values.tr;
                if (rangeRadiusTR2) rangeRadiusTR2.value = radius1Values.tr;
            }
        }
        if (corner === "br") {
            radius1Values.br = parseFloat(rangeRadiusBR.value);
            if (linkRadiusBRCheckbox?.checked) {
                radius2Values.br = radius1Values.br;
                if (rangeRadiusBR2) rangeRadiusBR2.value = radius1Values.br;
            }
        }
        if (corner === "bl") {
            radius1Values.bl = parseFloat(rangeRadiusBL.value);
            if (linkRadiusBLCheckbox?.checked) {
                radius2Values.bl = radius1Values.bl;
                if (rangeRadiusBL2) rangeRadiusBL2.value = radius1Values.bl;
            }
        }
    }
    function syncRadius2(corner) {
        if (corner === "tl") {
            radius2Values.tl = parseFloat(rangeRadiusTL2.value);
            if (linkRadiusTLCheckbox?.checked) {
                radius1Values.tl = radius2Values.tl;
                if (rangeRadiusTL) rangeRadiusTL.value = radius2Values.tl;
            }
        }
        if (corner === "tr") {
            radius2Values.tr = parseFloat(rangeRadiusTR2.value);
            if (linkRadiusTRCheckbox?.checked) {
                radius1Values.tr = radius2Values.tr;
                if (rangeRadiusTR) rangeRadiusTR.value = radius2Values.tr;
            }
        }
        if (corner === "br") {
            radius2Values.br = parseFloat(rangeRadiusBR2.value);
            if (linkRadiusBRCheckbox?.checked) {
                radius1Values.br = radius2Values.br;
                if (rangeRadiusBR) rangeRadiusBR.value = radius2Values.br;
            }
        }
        if (corner === "bl") {
            radius2Values.bl = parseFloat(rangeRadiusBL2.value);
            if (linkRadiusBLCheckbox?.checked) {
                radius1Values.bl = radius2Values.bl;
                if (rangeRadiusBL) rangeRadiusBL.value = radius2Values.bl;
            }
        }
    }

    // sync radius sliders
    if (source === rangeRadiusTL) syncRadius("tl");
    if (source === rangeRadiusTR) syncRadius("tr");
    if (source === rangeRadiusBR) syncRadius("br");
    if (source === rangeRadiusBL) syncRadius("bl");
    if (source === rangeRadiusTL2) syncRadius2("tl");
    if (source === rangeRadiusTR2) syncRadius2("tr");
    if (source === rangeRadiusBR2) syncRadius2("br");
    if (source === rangeRadiusBL2) syncRadius2("bl");

    // create border-radius string
    const rad1Array = [radius1Values.tl + "%", radius1Values.tr + "%", radius1Values.br + "%", radius1Values.bl + "%"];
    const rad2Array = [radius2Values.tl + "%", radius2Values.tr + "%", radius2Values.br + "%", radius2Values.bl + "%"];

    const allEqual1 = rad1Array.every(v => v === rad1Array[0]);
    const allEqual2 = rad2Array.every(v => v === rad2Array[0]);

    let borderRadiusValue = "";

    if (allEqual1 && allEqual2 && rad1Array[0] === rad2Array[0]) {
        borderRadiusValue = rad1Array[0];
    } else if (allEqual1) {
        borderRadiusValue = `${rad1Array[0]} / ${rad2Array.join(" ")}`;
    } else if (allEqual2) {
        borderRadiusValue = `${rad1Array.join(" ")} / ${rad2Array[0]}`;
    } else {
        borderRadiusValue = `${rad1Array.join(" ")} / ${rad2Array.join(" ")}`;
    }

    // apply styles to element
    shape.style.borderRadius = borderRadiusValue;
    shape.style.cornerShape = cornerShapeValue;

    // update global sliders if all equal
    if (allEqualEllipse && rangeCornerAll) rangeCornerAll.value = ellipseArray[0];
    if (allEqual1 && allEqual2 && rad1Array[0] === rad2Array[0]) {
        if (rangeRadiusAll) rangeRadiusAll.value = parseFloat(rad1Array[0]);
        if (rangeRadiusAll2) rangeRadiusAll2.value = parseFloat(rad2Array[0]);
    }

    // display CSS snippet
    const cssCode = `
border-radius: ${borderRadiusValue}; <br>
corner-shape: ${cornerShapeValue};
    `.trim();
    displayCode.innerHTML = cssCode;
}



function init() {
	// event listeners on all sliders
	[
		rangeCornerAll, rangeCornerTL, rangeCornerTR, rangeCornerBR, rangeCornerBL,
		rangeRadiusAll, rangeRadiusTL, rangeRadiusTR, rangeRadiusBR, rangeRadiusBL,
		rangeRadiusAll2, rangeRadiusTL2, rangeRadiusTR2, rangeRadiusBR2, rangeRadiusBL2,
	].forEach(slider => {
		if (slider) slider.addEventListener("input", () => updateShapeFromSlider(slider));
	});

	// event listeners on link checkboxes changes
	[
		linkRadiusAllCheckbox, linkRadiusTLCheckbox, linkRadiusTRCheckbox, linkRadiusBRCheckbox, linkRadiusBLCheckbox,
	].forEach(chk => {
		if (chk) chk.addEventListener("change", () => updateShapeFromSlider(null));
	});

	// initial update
	updateShapeFromSlider(null);
}

// copy code button
if (btnCopyCode) {
	btnCopyCode.addEventListener("click", () => {
		navigator.clipboard.writeText(displayCode.textContent).then(() => {
			msgEl.innerText = "Code copied!";
			setTimeout(() => (msgEl.textContent = ""), 1500);
		});
	});
}


// start it all up
init();