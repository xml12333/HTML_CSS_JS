import React, { StrictMode, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement(ScalingLetterToggle, { label: "Dummy" })));
function ScalingLetterToggle({ label, checked = false }) {
    const [isChecked, setIsChecked] = useState(checked);
    return (React.createElement("label", { "data-testid": "switch", className: "switch" },
        React.createElement("input", { "data-testid": "switch-input", className: "switch__input", type: "checkbox", role: "switch", checked: isChecked, onChange: () => setIsChecked(val => !val) }),
        React.createElement("span", { className: "switch__letters", "aria-hidden": "true" }, "n"),
        React.createElement("span", { className: "switch__letters", "aria-hidden": "true" }, "ff"),
        React.createElement("span", { className: "switch__sr" }, label)));
}