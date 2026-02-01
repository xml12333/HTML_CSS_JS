console.clear();

// select elements
const container = document.getElementById('linked-list');
const leftList = container.querySelector('.list.left');
const rightList = container.querySelector('.list.right');
const svg = container.querySelector('#links');

// small helper for path creation
function makePath(d) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute('d', d);
  p.setAttribute('stroke', '#333');
  p.setAttribute('fill', 'transparent');
  p.setAttribute('stroke-width', 2);
  return p;
}

// draw svg paths between checked checkboxes and the checked radio
function drawLinks() {
  svg.innerHTML = '';

  const checkboxes = leftList.querySelectorAll('input[type=checkbox]');
  const selectedRadio = rightList.querySelector('input[type=radio]:checked');
  if (!selectedRadio) return;

  const radioRect = selectedRadio.closest("li").getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  checkboxes.forEach(cb => {
    if (!cb.checked) return;

    const li = cb.closest('li');
    const cbRect = li.getBoundingClientRect();

    const startX = cbRect.right - svgRect.left;
    const startY = cbRect.top + cbRect.height / 2 - svgRect.top;

    const endX = radioRect.left - svgRect.left;
    const endY = radioRect.top + radioRect.height / 2 - svgRect.top;

    const midX = (startX + endX) / 2;
    const deltaY = endY - startY;

    // maximum radius
    const maxRadius = 25;

    // radius = distance to midpoint
    const radius = Math.min(maxRadius, Math.abs(midX - startX));

    // if small vertical distance → draw straight line
    if (Math.abs(deltaY) < 2) {
      svg.appendChild(makePath(`M ${startX},${startY} L ${endX},${endY}`));
      return;
    }

    // arc direction
    const dir1 = startY < endY ? 1 : 0;

    // vertical line endpoints
    const midStartY = startY + (dir1 ? radius : -radius);
    const midEndY   = endY - (dir1 ? radius : -radius);

    // sweep direction for final arc
    const sweepFlag2 = endY > midEndY ? 0 : 1;

    const d = [
      `M ${startX},${startY}`,
      `A ${radius},${radius} 0 0,${dir1} ${midX},${midStartY}`,
      `L ${midX},${midEndY}`,
      `A ${radius},${radius} 0 0,${sweepFlag2} ${endX},${endY}`
    ].join(' ');

    svg.appendChild(makePath(d));
  });
}

// redraw on UI changes
leftList.addEventListener('change', drawLinks);
rightList.addEventListener('change', drawLinks);
window.addEventListener('resize', drawLinks);

// initial render
drawLinks();