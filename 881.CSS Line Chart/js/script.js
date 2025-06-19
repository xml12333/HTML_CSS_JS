/*
JS *NOT NEEDED* for Chrome, only for Safari/Firefox

Uses the enhanced attr()-method in CSS
*/

if (!isAdvancedAttrSupported()) {
  const dataCharts = document.querySelectorAll('data-chart');
  dataCharts.forEach(dataChart => {
    const tbody = dataChart.querySelector('tbody');
    if (!tbody) return;

    const min = parseFloat(dataChart.getAttribute('min')) || 0;
    const max = parseFloat(dataChart.getAttribute('max')) || 100;
    const numCols = tbody.querySelectorAll('tr').length; 
    const valueCells = tbody.querySelectorAll('td[data-v]');

    tbody.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
    tbody.style.setProperty('--_min', min);
    tbody.style.setProperty('--_max', max);
    tbody.style.setProperty('--_t', parseFloat(tbody.getAttribute('data-t')) || 0);

    valueCells.forEach(td => {
      const v = parseFloat(td.getAttribute('data-v')) || 0;
      const pv = parseFloat(td.getAttribute('data-pv')) || v;
      const av = parseFloat(td.getAttribute('data-av')) || 0;

      td.style.setProperty('--_v', v);
      td.style.setProperty('--_pv', pv);
      td.style.setProperty('--_av', av);
    });
  });
}

function isAdvancedAttrSupported() {
  const T = document.createElement('div');
  document.body.appendChild(T);
  
  try {
    T.style.setProperty('--t', 'attr(data-test type(<number>), 0)');
    T.dataset.test = "123";

    const computedValue = getComputedStyle(T)
      .getPropertyValue('--t')
      .trim();
    
    return computedValue === "123";
  } catch (e) {
    return false;
  } finally {
    T.remove();
  }
}