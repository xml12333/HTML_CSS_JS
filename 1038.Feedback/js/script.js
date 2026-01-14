import React, { createContext, StrictMode, useContext, useMemo, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import clsx from "https://esm.sh/clsx";
import { LoaderCircle, MessageCircle, X } from "https://esm.sh/lucide-react";
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement("main", null,
        React.createElement(Feedback, null))));
function Feedback() {
    return (React.createElement(FeedbackProvider, null,
        React.createElement(FeedbackForm, null)));
}
function FeedbackBase({ onSubmit, children }) {
    const { status } = useFeedback();
    const submit = (e) => {
        e.preventDefault();
        onSubmit();
    };
    return (React.createElement("form", { className: clsx("feedback__base", status === "submitted" && "feedback__base--hidden"), onSubmit: submit }, children));
}
function FeedbackButton({ disabled, type = "button", onClick, children }) {
    return (React.createElement("button", { className: "feedback__button", type: type, disabled: disabled, onClick: onClick }, children));
}
function FeedbackComment() {
    const { rating, comment, setComment, status } = useFeedback();
    return (React.createElement("div", { className: clsx("feedback__comment", rating !== null && "feedback__comment--visible") },
        React.createElement("div", { className: "feedback__comment-inner" },
            React.createElement("label", { className: "feedback__label", htmlFor: "comment" }, "Tell us more (optional)"),
            React.createElement("textarea", { className: "feedback__textarea", id: "comment", name: "comment", value: comment, disabled: status !== "initial", onChange: (e) => setComment(e.target.value) }),
            React.createElement(FeedbackButton, { type: "submit", disabled: status !== "initial" }, status === "initial" ? ("Submit your feedback") : (React.createElement(LoaderCircle, { className: "spin" }))))));
}
function FeedbackForm() {
    const { setComment, setRating, status, setStatus } = useFeedback();
    const closeRef = useRef(0);
    const statusRef = useRef(0);
    const [isClosing, setIsClosing] = useState(false);
    const [isMounted, setIsMounted] = useState(true);
    const onClose = () => {
        setIsClosing(true);
        clearTimeout(statusRef.current);
        clearTimeout(closeRef.current);
        closeRef.current = setTimeout(reset, 300);
    };
    const onSubmit = () => {
        if (status === "submitting")
            return;
        setStatus("submitting");
        // logic to send data
        try {
            statusRef.current = setTimeout(() => {
                setStatus("submitted");
            }, 750);
        }
        catch (_a) {
            setStatus("initial");
        }
    };
    const reset = () => {
        setComment("");
        setIsClosing(false);
        setIsMounted(false);
        setRating(null);
        setStatus("initial");
    };
    if (!isMounted) {
        return (React.createElement(FeedbackButton, { onClick: () => setIsMounted(true) }, "Reset"));
    }
    return (React.createElement("div", { className: clsx("feedback", isClosing && "feedback--closing") },
        React.createElement(FeedbackBase, { onSubmit: onSubmit },
            React.createElement(FeedbackHeader, { onClose: onClose }),
            React.createElement(FeedbackOptions, null),
            React.createElement(FeedbackComment, null)),
        React.createElement(FeedbackOverlay, { onClose: onClose })));
}
function FeedbackHeader({ onClose }) {
    return (React.createElement("div", { className: "feedback__header" },
        React.createElement("h2", { className: "feedback__title" }, "Rate your experience"),
        React.createElement("button", { className: "feedback__close", type: "button", "aria-label": "Close", onClick: onClose },
            React.createElement(X, null))));
}
function FeedbackOptions() {
    const { rating, setRating, status } = useFeedback();
    const options = [
        {
            label: "Bad",
            emoji: "😔",
            particle: "👎",
            rating: "bad"
        },
        {
            label: "Decent",
            emoji: "🙂",
            particle: "👍",
            rating: "ok"
        },
        {
            label: "Love it!",
            emoji: "😍",
            particle: "❤️",
            rating: "good"
        }
    ];
    return (React.createElement("div", { className: "feedback__options" }, options.map((option) => (React.createElement("button", { key: option.rating, className: "feedback__option", type: "button", "aria-pressed": rating === option.rating, name: "rating", value: option.rating, disabled: status !== "initial", onClick: () => setRating(option.rating) },
        React.createElement(FeedbackParticles, { particle: option.particle }),
        React.createElement("span", { className: "feedback__emoji" }, option.emoji),
        option.label)))));
}
function FeedbackOverlay({ onClose }) {
    const { status } = useFeedback();
    const bubbleCount = 2;
    const bubbleArray = [];
    for (let b = 0; b < bubbleCount; ++b) {
        const bubbleKey = `bubble-${b}`;
        bubbleArray.push(React.createElement("div", { key: bubbleKey, className: "feedback__speech-bubble" },
            React.createElement(MessageCircle, null)));
    }
    return (React.createElement("div", { className: clsx("feedback__overlay", status === "submitted" && "feedback__overlay--active") },
        React.createElement("div", { className: "feedback__circle-bg" }),
        React.createElement("div", { className: "feedback__speech-bubbles" }, bubbleArray),
        React.createElement("div", { className: "feedback__content" },
            React.createElement("h2", { className: "feedback__title" }, "Thank you!"),
            React.createElement("p", { className: "feedback__text" }, "Your feedback helps us improve. We appreciate the time you took to send us the feedback!"),
            React.createElement(FeedbackButton, { onClick: onClose }, "Done"))));
}
function FeedbackParticles({ particle }) {
    const count = 3;
    const particleArray = [];
    for (let p = 0; p < count; ++p) {
        const particleKey = `particle-${p}`;
        particleArray.push(React.createElement("span", { key: particleKey, className: "feedback__particle", "aria-hidden": "true" }, particle));
    }
    return particleArray;
}
function FeedbackProvider({ children }) {
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(null);
    const [status, setStatus] = useState("initial");
    const providerValue = useMemo(() => ({
        comment,
        setComment,
        rating,
        setRating,
        status,
        setStatus
    }), [
        comment,
        setComment,
        rating,
        setRating,
        status,
        setStatus
    ]);
    return (React.createElement(FeedbackContext.Provider, { value: providerValue }, children));
}
const FeedbackContext = createContext(undefined);
function useFeedback() {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error("`useFeedback` must be used within a `FeedbackProvider`");
    }
    return context;
}