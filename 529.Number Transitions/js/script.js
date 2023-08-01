const $numbers = $demo.querySelectorAll(':scope > span');
const $comma = $demo.querySelector('comma');
$demoslide.onchange = morph;
$demoslide.oninput = () => {
  $demonum.value = $demoslide.value;
};
$demonum.onchange = () => {
  $demoslide.value = $demonum.value;
  morph();
};
function morph() {
  var _document;
  if ((_document = document) !== null && _document !== void 0 && _document.startViewTransition) {
    $comma.textContent = $demoslide.value > 999 ? ',' : '';
    document.startViewTransition(() => {
      const eachNumber = $demoslide.value.padStart(4).split('');
      eachNumber.forEach((val, i) => {
        if ($numbers[i].textContent === val) $numbers[i].style.viewTransitionName = 'none';else $numbers[i].textContent = val;
      });
    }).finished.then(() => {
      Array.from($numbers).forEach((val, i) => {
        $numbers[i].style.viewTransitionName = null;
      });
    });
  }
}