const SAMPLS = 15;
type Offset = { dx: number, dy: number }

class CircleBlurFilter {
    readonly namespace: string = "http://www.w3.org/2000/svg";
    defs: Element | undefined = undefined;
    circleBlurFilters: any = {}

    constructor(id: string, radius: number = 5, el: HTMLElement | undefined = undefined) {

        if (!el) el = document.documentElement;

        this.initSvg(el);
        this.createFilter(id, radius)
    }

    private initSvg(element: HTMLElement) {
        const svg = document.createElementNS(this.namespace, "svg");
        svg.setAttribute("viewBox", "0 0 600 600");
        svg.setAttribute("style", "position: fixed; z-index: -100000;");

        const defs = document.createElementNS(this.namespace, "defs");
        svg.appendChild(defs);
        this.defs = defs;

        element.appendChild(svg);
    }

    createFilter(id: string, radius: number) {
        const filter = document.createElementNS(this.namespace, "filter");
        filter.id = id;


        this.changeRadius(filter, radius);

        this.circleBlurFilters[id] = filter;

        this.defs?.appendChild(filter);
    }

    changeRadius(filter: Element, radius: number) {
        const offsets = this.getCircleOffsets(SAMPLS, radius);
        const uniqOffsets = this.findDuplicates(offsets).uniques;

        let offsetsFilter = ``;

        uniqOffsets.forEach((offset: Offset, index: number, arr: Offset[]) => {
            offsetsFilter += this.offsetWidthOpacity(
                offset,
                (100 / arr.length / 100) * 2,
                index.toPrecision()
            );
        });

        offsetsFilter += `<feMerge result="merge">`;

        uniqOffsets.forEach((offset: Offset, index: number, arr: Offset[]) => {
            offsetsFilter += `<feMergeNode in="cT${index}" />`;
        });

        offsetsFilter += `</feMerge><feGaussianBlur stdDeviation="${Math.abs(
            radius / 10
        )}"  in="merge" edgeMode="none" result="blur"/>`;
        filter.innerHTML = offsetsFilter;
    }


    getCircleOffsets(count = 30, radius = 8) {
        const offsets = [];
        const angleIncrement = (2 * Math.PI) / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleIncrement;
            const dx = Math.round(Math.cos(angle) * radius);
            const dy = Math.round(Math.sin(angle) * radius);
            offsets.push({ dx, dy });
        }

        return offsets;
    }
    offsetWidthOpacity(offset: Offset, opacity: number, id: string) {
        return `<feOffset dx="${offset.dx}" dy="${offset.dy}" in="SourceGraphic" result="o${id}" /><feComponentTransfer in="o${id}" result="cT${id}"><feFuncA type="table" tableValues="0 ${opacity}" /></feComponentTransfer>`;
    }

    findDuplicates(array: any[]) {
        const unique: any = {};
        const duplicates = [];
        const uniques = [];

        for (var i = 0; i < array.length; i++) {
            var objStr = JSON.stringify(array[i]);

            if (unique[objStr]) {
                duplicates.push(array[i]);
            } else {
                unique[objStr] = true;
                uniques.push(array[i]);
            }
        }

        return { uniques, duplicates };
    }
}

// import { CircleBlurFilter } from "./circle-blur-filter";

const circleBlurFilters = new CircleBlurFilter("circleBlurFront", 0);

circleBlurFilters.createFilter("circleBlurBack", -12.5);

const f1 = circleBlurFilters.circleBlurFilters["circleBlurFront"];
const f2 = circleBlurFilters.circleBlurFilters["circleBlurBack"];


const radiusInput: HTMLInputElement = document.querySelector("#radiusInput") as HTMLInputElement;
const dragable: HTMLElement = document.querySelector("#dragable") as HTMLElement;

if (radiusInput && dragable) {
    radiusInput.oninput = (e) => {
        const value: number = parseFloat(radiusInput.value);
        setValue(value)
    };

    dragable.addEventListener("pointerdown", e => {
        angle = getAngle(e.clientX, e.clientY)

        document.documentElement.style.setProperty("touch-action","none");

        document.documentElement.onpointermove = e => {
            setByCoords(e.clientX, e.clientY)
        }

        document.documentElement.onpointerup = e => {
            document.documentElement.onpointermove = null
            document.documentElement.onpointerup = null
        document.documentElement.style.setProperty("touch-action","unset");

        }
    })

}

const getRadians = (x: number, y: number) => Math.atan2(y, x);
const toDegrees = (radians: number) => (radians / Math.PI) * 180;

let angle = 0;
function setByCoords(clientX: number, clientY: number) {
    const a = getAngle(clientX, clientY)

    const foo = (a - angle) ;

    const bar = parseFloat(dragable.style.getPropertyValue("--deg"));

    const sum = foo + bar;

    const res = (sum <= -315) ? -315 : (sum >= 0) ? 0 : sum;

    // console.log(res);

    const value = mapBetween(res, 0, 100, 0, -315);

    radiusInput.value = value.toString();
    setValue(value)
    angle = a


    // setValue(value);
    // inputRange.value = value;
}

function getAngle(clientX: number, clientY: number) {
    const rect = dragable.getBoundingClientRect();
    const CX = rect.width / 2;
    const CY = rect.height / 2;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const r = getRadians(x - CX, y - CY);
    const res = Math.round(toDegrees(r)) + 90;
    return res;
}


function setValue(value: number) {
    const foo = mapBetween(value, -7.5, 12.5, 0, 100);
    const bar = mapBetween(value, -22.5, 2.5, 0, 100);

    const deg = mapBetween(value, 0, -315, 0, 100);

    circleBlurFilters.changeRadius(f1, foo);
    circleBlurFilters.changeRadius(f2, bar);
    console.log(value, bar);

    dragable.style.setProperty('--deg', deg + "deg")
}

setValue(40)

function mapBetween(currentNum: number, minAllowed: number, maxAllowed: number, min: number, max: number) {
    return (
        ((maxAllowed - minAllowed) * (currentNum - min)) / (max - min) + minAllowed
    );
}

function generateDynamicGeometricProgression(start: number, startRatio: number, length: number, ratioFn: Function) {
    const progression = [start];
    let ratio = startRatio;
    for (let i = 1; i < length; i++) {
        const previous: number = progression[i - 1];

        const next = previous * ratio;
        progression.push(next);
        ratio = ratioFn(ratio);
    }
    return progression;
}

function generateSequence() {
    let sequence = [];
    for (let i = 5; i < 315; i += 5) {
        if (i % 45 !== 0) {
            sequence.push(i);
        }
    }
    return sequence;
}

const start = .44;
const startRatio = 1.13;
const L = 8;

function ratioFunction(previous: number) {
    return previous + .45;
}

const dynamicProgression = generateDynamicGeometricProgression(start, startRatio, L, ratioFunction);
console.log(dynamicProgression);


const gradateLineTemplate = (deg: number) => `<line style="--deg: ${deg}deg;" x1="300" y1="30.5" x2="300" y2="40" />`;
const gradateLineTemplate2 = (deg: number) => `<line class="line2" style="--deg: ${deg}deg;" x1="300" x2="300" y1="67" y2="72" />`;

const gradateLineWithText = (deg: number, text: string) => `<g class="gradateLineWithText" style="--deg: ${deg}deg;">
<line x1="300" y1="30.5" x2="300" y2="55"></line><text x="5"><textPath href="#textPath">${text}</textPath></text></g>`

const sequence = generateSequence();

const gradateLines = document.querySelector("#gradateLines");

if (gradateLines) {
    sequence.forEach(s => {
        gradateLines.innerHTML += gradateLineTemplate(s);
    });

    const Q = dynamicProgression.length > 0 ? 360 / dynamicProgression.length : 0;

    dynamicProgression.forEach((item, index) => {

        const M = index != dynamicProgression.length - 1 ? item.toFixed(2) + "m" : "&infin;"

        gradateLines.innerHTML += gradateLineWithText((index) * Q, M)
    });

    for (let i = 0; i < 360; i += 5) {
        gradateLines.innerHTML += gradateLineTemplate2(i)
    }

}