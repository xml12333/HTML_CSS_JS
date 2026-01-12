import React, { StrictMode, useEffect, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import { addMinutes, format, isSameDay, isTomorrow, isYesterday } from "https://esm.sh/date-fns";
import { toZonedTime } from "https://esm.sh/date-fns-tz";
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement("main", null,
        React.createElement(SVGSprites, null),
        React.createElement(WorldClockSlider, null))));
function WorldClockSlider() {
    const containerRef = useRef(null);
    const [now, setNow] = useState(new Date());
    const [offsetMinutes, setOffsetMinutes] = useState(0);
    const [sliderX, setSliderX] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const localTime = addMinutes(now, offsetMinutes);
    const timeBound = 1440; // minutes
    const isRTL = document.dir === "rtl";
    const cities = [
        { name: "San Francisco", timeZone: "America/Los_Angeles" },
        { name: "Philadelphia", timeZone: "America/New_York" },
        { name: "London", timeZone: "Europe/London" },
        { name: "New Delhi", timeZone: "Asia/Kolkata" },
        { name: "Tokyo", timeZone: "Asia/Tokyo" }
    ];
    function handleMouseDown(e) {
        e.preventDefault();
        if (isResetting)
            return;
        setDragging(true);
        setShowTooltip(true);
    }
    function handleMouseMove(e) {
        if (isResetting || !dragging || !containerRef.current)
            return;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const { left, width } = containerRef.current.getBoundingClientRect();
        // clamp X to container bounds
        const clampedX = Math.max(0, Math.min(clientX - left, width));
        const clampedOffset = Math.max(-timeBound, Math.min(timeBound, Utils.getOffsetFromSliderX(clampedX, width, timeBound)));
        setOffsetMinutes(isRTL ? -clampedOffset : clampedOffset);
        setSliderX(Utils.getSliderXFromOffset(clampedOffset, width, timeBound));
    }
    function handleKeyDown(e) {
        if (isResetting || !containerRef.current)
            return;
        const step = 30; // minutes
        const { width } = containerRef.current.getBoundingClientRect();
        const { key } = e;
        const isHome = key === "Home";
        const isEnd = key === "End";
        const towardEnd = key === "ArrowUp" || key === "ArrowRight";
        const towardStart = key === "ArrowDown" || key === "ArrowLeft";
        let newOffset = offsetMinutes;
        if (isHome) {
            newOffset = -timeBound;
        }
        else if (isEnd) {
            newOffset = timeBound;
        }
        else if (towardEnd) {
            newOffset = Math.min(timeBound, offsetMinutes + step);
        }
        else if (towardStart) {
            newOffset = Math.max(-timeBound, offsetMinutes - step);
        }
        else {
            return;
        }
        e.preventDefault();
        setOffsetMinutes(newOffset);
        setSliderX(Utils.getSliderXFromOffset(isRTL ? -newOffset : newOffset, width, timeBound));
        setShowTooltip(true);
    }
    function handleContainerClick(e) {
        const target = e.target;
        if (isResetting || target.closest("[data-close]") || !containerRef.current)
            return;
        const { left, width } = containerRef.current.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - left, width));
        const newOffset = Utils.getOffsetFromSliderX(x, width, timeBound);
        const clampedOffset = Math.max(-timeBound, Math.min(timeBound, newOffset));
        setOffsetMinutes(isRTL ? -clampedOffset : clampedOffset);
        setSliderX(Utils.getSliderXFromOffset(clampedOffset, width, timeBound));
        setShowTooltip(true);
        setDragging(true);
    }
    function refreshSlider() {
        if (!containerRef.current)
            return;
        const { width } = containerRef.current.getBoundingClientRect();
        setSliderX(Utils.getSliderXFromOffset(offsetMinutes, width, timeBound));
    }
    function resetSlider() {
        if (isResetting || !containerRef.current)
            return;
        setIsResetting(true);
        const { width } = containerRef.current.getBoundingClientRect();
        const fromOffset = offsetMinutes;
        const fromSliderX = sliderX !== null && sliderX !== void 0 ? sliderX : Utils.getSliderXFromOffset(offsetMinutes, width, timeBound);
        const targetOffset = 0;
        const targetSliderX = Utils.getSliderXFromOffset(targetOffset, width, timeBound);
        const duration = 300;
        Utils.animateValue(fromOffset, targetOffset, duration, (val) => setOffsetMinutes(Math.round(val)), () => {
            setIsResetting(false);
            setOffsetMinutes(targetOffset);
            setShowTooltip(false);
        });
        Utils.animateValue(fromSliderX, targetSliderX, duration, (val) => setSliderX(val), () => setSliderX(null) // recalculate if null is the default
        );
    }
    // clock ticker and slider position
    useEffect(() => {
        let timeoutId;
        const tick = () => {
            setNow(new Date());
            timeoutId = setTimeout(tick, 1e3);
        };
        tick();
        refreshSlider();
        return () => clearTimeout(timeoutId);
    }, []);
    // event listeners
    useEffect(() => {
        const handleMove = (e) => handleMouseMove(e);
        const handleUp = () => setDragging(false);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("touchmove", handleMove);
        window.addEventListener("touchend", handleUp);
        window.addEventListener("resize", refreshSlider);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleUp);
            window.removeEventListener("resize", refreshSlider);
        };
    }, [dragging]);
    return (React.createElement("div", { className: "clocks", ref: containerRef, onMouseDown: handleContainerClick, onTouchStart: handleContainerClick },
        React.createElement(WorldClockSliderWrapper, { x: sliderX },
            React.createElement(WorldClockTooltip, { show: showTooltip, offsetMinutes: offsetMinutes, closeAction: resetSlider }),
            React.createElement(WorldClockSliderLine, { value: offsetMinutes, min: -timeBound, max: timeBound, onMouseDown: handleMouseDown, onTouchStart: handleMouseDown, onKeyDown: handleKeyDown })),
        cities.map((city, i) => (React.createElement(WorldClockRow, { key: i, localTime: localTime, city: city })))));
}
function WorldClockRow({ localTime, city }) {
    const cityTime = toZonedTime(localTime, city.timeZone);
    const { relative, full, short } = Utils.getRelativeTimestamp(localTime, cityTime);
    const hour = cityTime.getHours();
    const tod = Utils.getTimeOfDay(hour);
    const rowClass = `clocks__row clocks__row--${tod}`;
    return (React.createElement("div", { className: rowClass },
        React.createElement("div", { className: "clocks__start" },
            React.createElement("div", { className: "clocks__city" }, city.name),
            React.createElement("div", { className: "clocks__relative clocks__relative--full" },
                relative,
                ", ",
                full),
            React.createElement("div", { className: "clocks__relative clocks__relative--short" },
                relative,
                ", ",
                short)),
        React.createElement("div", { className: "clocks__end" },
            React.createElement("div", { className: "clocks__tod" },
                React.createElement(Icon, { name: tod })),
            React.createElement("div", { className: "clocks__time" },
                format(cityTime, "h:mm"),
                React.createElement("small", { className: "clocks__m" }, format(cityTime, "a"))))));
}
function WorldClockSliderLine({ value, min, max, onMouseDown, onTouchStart, onKeyDown }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "slider-label", className: "clocks__sr-only" }, "Peek time"),
        React.createElement("div", { className: "clocks__slider", tabIndex: 0, role: "slider", "aria-labelledby": "slider-label", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, "aria-valuetext": Utils.formatOffset(value), onMouseDown: onMouseDown, onTouchStart: onTouchStart, onKeyDown: onKeyDown },
            React.createElement("div", { className: "clocks__slider-line" }),
            React.createElement("div", { className: "clocks__slider-arrow clocks__slider-arrow--left" },
                React.createElement(Icon, { name: "triangle-left" })),
            React.createElement("div", { className: "clocks__slider-arrow clocks__slider-arrow--right" },
                React.createElement(Icon, { name: "triangle-right" })))));
}
function WorldClockSliderWrapper({ x, children }) {
    const sliderStyle = {
        left: x != null ? `${x}px` : "50%"
    };
    return (React.createElement("div", { className: "clocks__slider-wrapper", style: sliderStyle }, children));
}
function WorldClockTooltip({ show, offsetMinutes, closeAction }) {
    const toolTipClass = `clocks__tooltip${show ? " clocks__tooltip--show" : ""}`;
    return (React.createElement("div", { className: toolTipClass },
        Utils.formatOffset(offsetMinutes),
        React.createElement("button", { className: "clocks__tooltip-close", type: "button", "aria-label": "Reset", onClick: closeAction, "data-close": true },
            React.createElement(Icon, { name: "close" }))));
}
function Icon({ name }) {
    const href = `#${name}`;
    return (React.createElement("svg", { className: "icon", width: "16px", height: "16px", "aria-hidden": "true" },
        React.createElement("use", { href: href })));
}
function SVGSprites() {
    return (React.createElement("svg", { width: "0", height: "0", display: "none" },
        React.createElement("symbol", { id: "close", viewBox: "0 0 16 16" },
            React.createElement("g", { stroke: "currentcolor", strokeLinecap: "round", strokeWidth: "2" },
                React.createElement("polyline", { points: "2 2,14 14" }),
                React.createElement("polyline", { points: "2 14,14 2" }))),
        React.createElement("symbol", { id: "day", viewBox: "0 0 16 16" },
            React.createElement("path", { fill: "currentcolor", d: "M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" })),
        React.createElement("symbol", { id: "night", viewBox: "0 0 16 16" },
            React.createElement("g", { fill: "currentcolor" },
                React.createElement("path", { d: "M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" }),
                React.createElement("path", { d: "M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z" }))),
        React.createElement("symbol", { id: "sunrise", viewBox: "0 0 16 16" },
            React.createElement("path", { fill: "currentcolor", d: "M7.646 1.146a.5.5 0 0 1 .708 0l1.5 1.5a.5.5 0 0 1-.708.708L8.5 2.707V4.5a.5.5 0 0 1-1 0V2.707l-.646.647a.5.5 0 1 1-.708-.708l1.5-1.5zM2.343 4.343a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM11.709 11.5a4 4 0 1 0-7.418 0H.5a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" })),
        React.createElement("symbol", { id: "sunset", viewBox: "0 0 16 16" },
            React.createElement("path", { fill: "currentcolor", d: "M7.646 4.854a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V1.5a.5.5 0 0 0-1 0v1.793l-.646-.647a.5.5 0 1 0-.708.708l1.5 1.5zm-5.303-.51a.5.5 0 0 1 .707 0l1.414 1.413a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .706l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM11.709 11.5a4 4 0 1 0-7.418 0H.5a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" })),
        React.createElement("symbol", { id: "triangle-left", viewBox: "0 0 16 16" },
            React.createElement("polygon", { fill: "currentcolor", points: "0 8,12 2,12 14" })),
        React.createElement("symbol", { id: "triangle-right", viewBox: "0 0 16 16" },
            React.createElement("polygon", { fill: "currentcolor", points: "16 8,4 2,4 14" }))));
}
class Utils {
    static animateValue(from, to, duration, onUpdate, onComplete) {
        const start = performance.now();
        const frame = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutSine(progress);
            const currentValue = from + (to - from) * eased;
            onUpdate(currentValue);
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
            else {
                onComplete();
            }
        };
        requestAnimationFrame(frame);
    }
    static easeInOutSine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }
    static formatOffset(mins) {
        if (mins === 0)
            return "Now";
        const sign = mins >= 0 ? "+" : "-";
        const abs = Math.abs(mins);
        const hrs = Math.floor(abs / 60);
        const min = abs % 60;
        return `${sign}${hrs}:${String(min).padStart(2, "0")}`;
    }
    static formatShortDate(date) {
        return new Intl.DateTimeFormat(this.LOCALE, {
            month: "short",
            day: "numeric",
        }).format(date);
    }
    static getOffsetFromSliderX(x, containerWidth, maxOffset) {
        const centerX = containerWidth / 2;
        const deltaX = x - centerX;
        const ratio = deltaX / centerX;
        return Math.round(ratio * maxOffset);
    }
    static getRelativeTimestamp(timeA, timeB) {
        const now = new Date();
        let relative = this.formatShortDate(timeB);
        if (isSameDay(now, timeB))
            relative = "Today";
        if (isTomorrow(timeB))
            relative = "Tomorrow";
        if (isYesterday(timeB))
            relative = "Yesterday";
        const diffMs = timeB.getTime() - timeA.getTime();
        const diffTotalMinutes = Math.round(diffMs / (1000 * 60));
        const offsetAbsMinutes = Math.abs(diffTotalMinutes);
        const offsetHours = Math.floor(offsetAbsMinutes / 60);
        const is1Hour = offsetHours === 1;
        const hoursLabel = is1Hour ? "hour" : "hours";
        const offsetMinutes = offsetAbsMinutes % 60;
        const is1Minute = offsetMinutes === 1;
        const minutesLabel = is1Minute ? "minute" : "minutes";
        const ahead = diffTotalMinutes > 0;
        const behind = diffTotalMinutes < 0;
        const sign = ahead ? "+" : behind ? "-" : "±";
        const parts = [];
        if (offsetHours > 0)
            parts.push(`${offsetHours} ${hoursLabel}`);
        if (offsetMinutes > 0)
            parts.push(`${offsetMinutes} ${minutesLabel}`);
        if (parts.length === 0)
            parts.push("same time");
        let full = parts.join(" ");
        if (ahead)
            full += " ahead";
        if (behind)
            full += " behind";
        const shortHours = `${sign}${offsetHours}`;
        const shortMins = `${shortHours}:${offsetMinutes.toString().padStart(2, "0")}`;
        const shortMins00 = `${shortHours}${is1Hour ? "HR" : "HRS"}`;
        const short = offsetMinutes > 0 ? shortMins : shortMins00;
        return { relative, full, short };
    }
    static getSliderXFromOffset(offsetMinutes, containerWidth, maxOffset) {
        const centerX = containerWidth / 2;
        return centerX + (offsetMinutes / maxOffset) * centerX;
    }
    static getTimeOfDay(hour) {
        if (hour >= 6 && hour < 9)
            return "sunrise";
        if (hour >= 9 && hour < 18)
            return "day";
        if (hour >= 18 && hour < 20)
            return "sunset";
        return "night";
    }
}
Utils.LOCALE = navigator.language;
;
;
;
;
;