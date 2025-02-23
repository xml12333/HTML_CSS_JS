const gridContainer = document.getElementById("grid-container");
let itemCount = 0;
let loading = false;

const itemDimensions = [
  { columns: 2, rows: 1 },
  { columns: 1, rows: 2 },
  { columns: 1, rows: 1 },
  { columns: 2, rows: 2 },
  { columns: 1, rows: 1 },
  { columns: 2, rows: 1 },
  { columns: 1, rows: 2 },
  { columns: 1, rows: 1 },
  { columns: 3, rows: 1 },
  { columns: 1, rows: 2 },
  { columns: 2, rows: 2 },
  { columns: 1, rows: 1 },
  { columns: 1, rows: 3 },
  { columns: 2, rows: 1 },
  { columns: 1, rows: 1 },
  { columns: 2, rows: 2 },
  { columns: 1, rows: 1 },
  { columns: 1, rows: 2 },
  { columns: 2, rows: 1 },
  { columns: 1, rows: 1 }
];

const loadMoreItems = () => {
  if (loading) return;
  loading = true;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 50; i++) {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.textContent = `Item ${itemCount + 1}`;

    const dimensions = itemDimensions[itemCount % itemDimensions.length];
    //const dimensions = getRandomDimensions();
    if (dimensions) {
      gridItem.style.gridColumn = `span ${dimensions.columns}`;
      gridItem.style.gridRow = `span ${dimensions.rows}`;
    }

    itemCount++;
    fragment.appendChild(gridItem);
  }
  gridContainer.appendChild(fragment);
  loading = false;
};

function getRandomDimensions() {
  const columnsRnd = Math.random();
  const rowsRnd = Math.random();
  return {
    columns: columnsRnd < 0.4 ? 1 : columnsRnd < 0.8 ? 2 : 3,
    rows: rowsRnd < 0.4 ? 1 : rowsRnd < 0.8 ? 2 : 3
  };
}

loadMoreItems();

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
    !loading
  ) {
    loadMoreItems();
  }
});