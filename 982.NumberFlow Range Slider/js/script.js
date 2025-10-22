import RangeSlider from "https://esm.sh/svelte-range-slider-pips";
import 'https://esm.sh/number-flow'

const startValue = 12;
const baseValue = 45;
const min = 5;
const max = 60;
const suffix = " min";

// initialise the slider
const slider = new RangeSlider({
    target: document.querySelector('#slider'),
    props: {
        value: startValue,
        min,
        max,
        range: 'min',
        pips: true,
        all: 'label',
        suffix: suffix,
        springValues: { stiffness: 0.125, damping: 0.4 },
    }
});

// initialise NumberFlow
const flow = document.querySelector('number-flow')
flow.numberSuffix = suffix
flow.update(baseValue);
flow.classList.add('initialised');

const setSlider = (v, delay = 0) => {
    setTimeout(() => {
        slider.$set({ value: v });
    }, delay);
};

const setFlow = (v, delay = 0) => {
    setTimeout(() => {
        flow.update(v);
        updateFlowPosition(v);
    }, delay);
}

const setBoth = (v, delay = 0) => {
    setSlider(v,delay);
    setFlow(v,delay);
}

// update NumberFlow when slider changes
slider.$on('change', ({ detail }) => {
    setFlow( detail.value );
});

// re-position NumberFlow when the slider changes.
const updateFlowPosition = (v) => {
    const flow = document.querySelector('number-flow');
    const slider = document.querySelector('#slider .rangeSlider');
    const handle = document.querySelector('#slider .rangeHandle');
    requestAnimationFrame(() => {
        let pos = parseFloat( handle.style.getPropertyValue('--handle-pos') || 0);
        let length = parseFloat( slider.style.getPropertyValue('--slider-length') || 0);
        if ( v ) {
            pos = ((v * (100) / (max - min)) - min);
        }
        flow.classList.toggle( 'on-left', pos > 70 );
        flow.style.setProperty( '--handle-pos', pos );
        flow.style.setProperty( '--slider-length', length );
    }); 
};




/* intro animation */

let animationInterval;
let animationValue = startValue; 
animationInterval = setInterval(() => {
    animationValue++;
    setBoth( animationValue, 50 );
    if( animationValue >= baseValue) {
        clearInterval(animationInterval);
    }
}, 16);

document.body.addEventListener('pointerdown', () => {
    clearInterval(animationInterval);
})



/* toggle numberflow on/off */

const $toggle = document.querySelector('#toggle > input');
const $title = document.querySelector('h1');
$toggle.addEventListener('change', () => {
    const isChecked = $toggle.checked
    flow.animated = isChecked;
    $title.innerText = (isChecked ? 'NumberFlow' : 'Range Pips') + ' Slider';
});












/* handle theme toggle */

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const $themeToggle = document.querySelector('#theme-toggle');
$themeToggle.checked = prefersDarkMode;
const setTheme = () => {
    document.body.classList.add('themed');
    document.body.toggleAttribute('is-dark', $themeToggle.checked);
}
$themeToggle.addEventListener('change', setTheme);
setTheme();