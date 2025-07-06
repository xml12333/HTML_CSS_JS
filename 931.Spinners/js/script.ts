import React, { StrictMode, useEffect, useRef } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";

// enums
enum Color {
	CurrentColor = "currentcolor",
	HotPink = "hsl(340, 90%, 60%)",
	Red = "hsl(340, 90%, 50%)",
	RedOrange = "hsl(15, 90%, 50%)",
	Orange = "hsl(30, 90%, 50%)",
	Yellow = "hsl(40, 90%, 60%)",
	Aquamarine = "hsl(160, 90%, 60%)",
	Green = "hsl(160, 90%, 40%)",
	Blue = "hsl(205, 90%, 60%)",
	Purple = "hsl(280, 90%, 60%)",
	Violet = "hsl(280, 90%, 50%)"
}
enum Easing {
	EaseInOutSine = "cubic-bezier(0.37, 0, 0.63, 1)",
	EaseOutSine = "cubic-bezier(0.61, 1, 0.88, 1)",
	Linear = "linear"
}

// config
const preloaders: PreloaderProps[] = [
	{
		rings: [
			{
				angleStart: 240,
				angleEnd: -370,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 27,
				strokeWidth: 44,
				easing: Easing.EaseOutSine
			},
			{
				angleStart: -360,
				angleEnd: 540,
				segmentLength: 1 / 32,
				strokeLength: 2 / 3,
				r: 48,
				strokeWidth: 2,
				stroke: Color.RedOrange
			},
			{
				angleStart: 330,
				angleEnd: -355,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 44,
				strokeWidth: 10,
				stroke: Color.Yellow
			},
			{
				angleStart: -420,
				angleEnd: 360,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 27,
				strokeWidth: 3,
				stroke: Color.HotPink
			},
			{
				angleStart: -405,
				angleEnd: 360,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 8,
				strokeWidth: 16,
				stroke: Color.Blue,
				fromBottom: true
			}
		]
	},
	{
		rings: [
			{
				angleStart: -360,
				angleEnd: 250,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 27,
				strokeWidth: 44,
				easing: Easing.EaseOutSine
			},
			{
				angleStart: 300,
				angleEnd: -360,
				segmentLength: 1,
				strokeLength: 5 / 6,
				r: 46,
				strokeWidth: 6,
				stroke: Color.Aquamarine
			},
			{
				angleStart: -375,
				angleEnd: 180,
				segmentLength: 1 / 12,
				strokeLength: 0.5,
				r: 15,
				strokeWidth: 5,
				stroke: Color.Violet
			}
		]
	},
	{
		rings: [
			{
				angleStart: 240,
				angleEnd: -370,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 27,
				strokeWidth: 44,
				easing: Easing.EaseOutSine
			},
			{
				angleStart: 210,
				angleEnd: -420,
				segmentLength: 1,
				strokeLength: 7 / 12,
				r: 46,
				strokeWidth: 6,
				stroke: Color.Purple
			},
			{
				angleStart: -390,
				angleEnd: 300,
				segmentLength: 1,
				strokeLength: 0.5,
				r: 30,
				strokeWidth: 3,
				stroke: Color.Red
			},
			{
				angleStart: 240,
				angleEnd: -390,
				segmentLength: 1 / 32,
				strokeLength: 2 / 3,
				r: 15,
				strokeWidth: 5,
				stroke: Color.Violet
			}
		]
	},
	{
		rings: [
			{
				angleStart: -360,
				angleEnd: 250,
				segmentLength: 1,
				strokeLength: 2 / 3,
				r: 27,
				strokeWidth: 44,
				easing: Easing.EaseOutSine
			},
			{
				angleStart: -360,
				angleEnd: 300,
				segmentLength: 1,
				strokeLength: 5 / 6,
				r: 44,
				strokeWidth: 10,
				stroke: Color.Blue
			},
			{
				angleStart: -360,
				angleEnd: 300,
				segmentLength: 1 / 19,
				strokeLength: 7 / 16,
				r: 30,
				strokeWidth: 3,
				stroke: Color.Green
			},
			{
				angleStart: 450,
				angleEnd: -360,
				segmentLength: 1,
				strokeLength: 13 / 12,
				r: 8,
				strokeWidth: 16,
				stroke: Color.Orange
			}
		]
	}
];

// components
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<main>
			{preloaders.map((pl, i) => <Preloader key={i} {...pl} />)}
		</main>
	</StrictMode>
);

function Preloader({ rings }: PreloaderProps) {
	const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
	const size = 100;
	const sizePx = `${size}px`;
	const halfway = size / 2;
	const viewBox = `0 0 ${size} ${size}`;
	const rotationFix = `rotate(-90, ${halfway}, ${halfway})`;

	useEffect(() => {
		const animOptions: KeyframeAnimationOptions = {
			duration: 2000,
			iterations: Infinity
		};

		circleRefs.current.forEach((circle, i) => {
			if (!rings || !circle) return;

			const {
				angleStart = 0,
				angleEnd = 360,
				easing = Easing.Linear,
				r = 0
			} = rings[i];
			const dist = Utils.circumference(r);

			circle.animate([
				{ strokeDashoffset: angleStart / 360 * dist },
				{ strokeDashoffset: angleEnd / 360 * dist }
			], {
				...animOptions,
				easing
			});
		});
	}, [])

	return (
		<svg
			role="img"
			aria-label="Randomly-colored circle strokes changing in length as they rotate in random directions"
			className="pl"
			viewBox={viewBox}
			width={sizePx}
			height={sizePx}
		>
			<g transform={rotationFix}>
				{rings?.map((ring, i) => {
					const {
						fromBottom = false,
						segmentLength = 1,
						strokeLength = 1,
						r = 0,
						stroke = "currentcolor",
						strokeWidth = 1
					} = ring;
					const circleTransform = fromBottom ? `rotate(180, ${halfway}, ${halfway})` : undefined;
					const dist = Utils.circumference(r);
					const strokeVisible = dist * strokeLength;
					const strokeInvisible = dist * 2;
					const strokeTotalLength = strokeVisible + strokeInvisible;
					const strokeVisibleSegment = strokeVisible * segmentLength;
					const strokeDasharray = Utils.strokeToDashes(
						strokeTotalLength,
						strokeVisibleSegment,
						strokeVisible
					);

					return (
						<circle
							key={i}
							ref={(el) => { circleRefs.current[i] = el }}
							fill="none"
							cx={halfway}
							cy={halfway}
							strokeDasharray={strokeDasharray}
							r={r}
							stroke={stroke}
							strokeWidth={strokeWidth}
							transform={circleTransform}
						/>
					)
				})}
			</g>
		</svg>
	);
}

class Utils {
	/**
	 * Get the circumference from a given radius.
	 * @param r radius
	 */
	static circumference(r: number) {
		return 2 * Math.PI * r;
	}
	/**
	 * Divide a stroke into dashes of a specified length.
	 * @param totalLength Length of dashed stroke plus the invisible part
	 * @param strokeLength Length of one dash
	 * @param visibleLength Length of dashes combined
	 */
	static strokeToDashes(totalLength: number, strokeLength: number, visibleLength: number): string {
		const dashArray: number[] = [];
		let chunkCount = 0;

		if (strokeLength > 0) {
			// zero or negative stroke lengths will lead to infinite loops
			chunkCount = Math.floor(visibleLength / strokeLength);

			for (let i = 0; i < chunkCount; i++) {
				dashArray.push(strokeLength);
			}
		} else {
			dashArray.push(0);
		}

		const usedVisible = chunkCount * strokeLength;
		const trailingGap = totalLength - usedVisible;

		if (dashArray.length % 2 === 0) {
			const removed = dashArray.pop() || 0;

			dashArray.push(trailingGap + removed);
		} else {
			dashArray.push(trailingGap);
		}

		return dashArray.join(" ");
	}
}

// interfaces
interface PreloaderProps {
	rings?: PreloaderRing[];
};
interface PreloaderRing {
	/** Angle where the stroke should start */
	angleStart?: number;
	/** Angle where the stroke should end */
	angleEnd?: number;
	/** Timing function */
	easing?: Easing;
	/** Stroke should originate from the bottom */
	fromBottom?: boolean;
	/** Radius in px */
	r?: number;
	/** Percentage of visible stroke that should be a segment */
	segmentLength?: number;
	/** Stroke color */
	stroke?: Color;
	/** Percentage of circle that should show the stroke */
	strokeLength?: number;
	/** Stroke thickness in px */
	strokeWidth?: number;
};