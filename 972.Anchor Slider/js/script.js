import RangeSlider from "https://esm.sh/svelte-range-slider-pips";

let value = 0;
const min = -50;
const max = 50;

const contrastSlider = new RangeSlider({
    target: document.getElementById("contrast-slider"),
    props: {
        value,
        vertical: true,
        pips: true,
        step: 5,
        min,
        max,
        float: false
    }
});

const $button = document.querySelector('button[popovertarget]');
const $value = document.querySelector('.contrast-buttons > span')
const $up = document.querySelector('#up')
const $down = document.querySelector('#down')

const updateValue = v => {
    value = v;
    setValue(v);
    contrastSlider.$set({ values: [ v ]});
}
const setValue = (v) => {
    $value.innerText = v;
    const html = document.body.parentElement;
    html.style.filter = `contrast(${v/300 + 1})`
}
contrastSlider.$on('change', (e) => {
    value = e.detail.value;
    setValue( value );
});
const increase = () => {
    value = Math.min(value + 5, max);
    updateValue(value);
};
const decrease = () => {
    value = Math.max(value - 5, min);
    updateValue(value);
};


let intervalId;
const startFiring = (cb) => { intervalId = setInterval(cb, 50); };
const stopFiring = () => { clearInterval(intervalId); };

$up.addEventListener( 'pointerdown', () => {
    stopFiring()
    startFiring(increase);
});
$up.addEventListener( 'pointerup', () => {
    stopFiring();
});
$up.addEventListener( 'pointerleave', () => {
    stopFiring();
});
$down.addEventListener( 'pointerdown', () => {
    stopFiring()
    startFiring(decrease);
});
$down.addEventListener( 'pointerup', () => {
    stopFiring();
});
$down.addEventListener( 'pointerleave', () => {
    stopFiring();
});


// auto show for preview
const $popover = document.querySelector('#contrast-popover');
setTimeout(() => {
    $popover.showPopover();
}, 1500);

$popover.addEventListener("toggle", (event) => {
    if ( event.newState === 'closed' ) {
        $button.focus();
    } else {
        const focusEvent = new FocusEvent('focus', {
            bubbles: true, // Set to true if you want the event to bubble up the DOM tree
            cancelable: false // Focus events are generally not cancelable
        });
        contrastSlider.$$.root.querySelector('.rangeHandle').focus(); 
    }
})