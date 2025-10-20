document.addEventListener("DOMContentLoaded", () => {
  const COLUMNS = ["Time", "From", "To", "Platform", "Status"];
  const ROWS = 8,
    UPDATE_MS = 3200;
  const ARRIVALS = {
    origins: [
      "Graveyard Hollow",
      "Fogbank Station",
      "Blackwood Fen",
      "Wraith Dunes",
      "Widow’s Peak",
      "Shade Harbor"
    ],
    destinations: [
      "Hell’s Gate",
      "Crypt 3A",
      "Underworld",
      "Catacomb Loop",
      "Cemetery Cross",
      "Ghoul Alley"
    ]
  };
  const DEPARTURES = {
    origins: ARRIVALS.destinations,
    destinations: ARRIVALS.origins
  };
  const STATUSES = ["On time", "Boarding", "Arrived", "Delayed", "Manifesting"];
  const PLATFORMS = [
    "Track 13",
    "Track 9¾",
    "Track 0",
    "Track 66",
    "Track 666",
    "Platform A",
    "Platform B",
    "Deep Tunnel"
  ];

  const board = document.getElementById("board");
  const modeSelect = document.getElementById("modeSelect");
  const marqueeTrack = document.getElementById("marqueeTrack");
  const marqueeSpans = marqueeTrack.querySelectorAll("span");

  const pad2 = (n) => String(n).padStart(2, "0");
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const srcFor = (m) => (m === "arrivals" ? ARRIVALS : DEPARTURES);

  function upcomingTime(mins = Math.floor(Math.random() * 10) + 1) {
    const d = new Date(Date.now() + mins * 60_000);
    let h = d.getHours(),
      m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${pad2(h)}:${pad2(m)} ${ap}`;
  }

  function makeHalf(text) {
    const half = document.createElement("div");
    half.className = "half";
    const txt = document.createElement("div");
    txt.className = "txt";
    txt.textContent = text;
    half.appendChild(txt);
    return half;
  }

  function makeCell(col, text) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.col = col;
    const slot = document.createElement("div");
    slot.className = "slot";
    const top = makeHalf(text);
    top.classList.add("top");
    const bottom = makeHalf(text);
    bottom.classList.add("bottom");
    slot.append(top, bottom);
    cell.append(slot);
    return cell;
  }

  function setText(half, val) {
    half.querySelector(".txt").textContent = val;
  }

  function flipTo(cell, next) {
    const slot = cell.querySelector(".slot");
    const cur = slot.querySelector(".top .txt").textContent;
    if (cur === next) return;
    const topFlip = makeHalf(cur);
    topFlip.classList.add("top-flip");
    const bottomFlip = makeHalf(next);
    bottomFlip.classList.add("bottom-flip");
    topFlip.addEventListener("animationend", () => {
      setText(slot.querySelector(".top"), next);
      topFlip.remove();
    });
    bottomFlip.addEventListener("animationend", () => {
      setText(slot.querySelector(".bottom"), next);
      bottomFlip.remove();
    });
    slot.append(topFlip, bottomFlip);
  }

  function makeRowData(mode) {
    const s = srcFor(mode);
    return {
      Time: upcomingTime(),
      From: pick(s.origins),
      To: pick(s.destinations),
      Platform: pick(PLATFORMS),
      Status: pick(STATUSES)
    };
  }

  let mode = "arrivals",
    rows = [];

  function clearRows() {
    [...board.children].slice(5).forEach((n) => n.remove());
  }

  function renderBoard() {
    clearRows();
    rows = [];
    for (let i = 0; i < ROWS; i++) {
      const data = makeRowData(mode);
      const row = document.createElement("div");
      row.className = "row";
      row.style.display = "contents";
      const cells = COLUMNS.map((col) => {
        const cell = makeCell(col, data[col]);
        if (col === "Status") cell.dataset.status = data[col];
        row.appendChild(cell);
        return cell;
      });
      board.appendChild(row);
      rows.push({ data, cells });
    }
    updateMarquee();
  }

  function updateOneRow(i) {
    const r = rows[i],
      next = { ...r.data };
    next.Time = upcomingTime();
    if (Math.random() < 0.5) next.Status = pick(STATUSES);
    if (Math.random() < 0.5) {
      const s = srcFor(mode);
      next.From = pick(s.origins);
      next.To = pick(s.destinations);
      next.Platform = pick(PLATFORMS);
    }
    r.cells.forEach((c) => {
      const col = c.dataset.col,
        nv = next[col];
      if (nv !== r.data[col]) {
        flipTo(c, nv);
        if (col === "Status") c.dataset.status = nv;
      }
    });
    r.data = next;
  }

  function updateSomeRows() {
    if (!rows.length) return;
    const a = Math.floor(Math.random() * rows.length);
    let b = Math.floor(Math.random() * rows.length);
    if (b === a) b = (b + 1) % rows.length;
    updateOneRow(a);
    updateOneRow(b);
    updateMarquee();
  }

  function updateMarquee() {
    const msg = rows
      .map((r) => {
        const d = r.data;
        return `<span style="color:#c4c7cc">${d.Time} · ${d.From} → ${d.To} · ${d.Platform} · ${d.Status}</span>`;
      })
      .join("   ✦   ");
    marqueeSpans[0].innerHTML = msg;
    marqueeSpans[1].innerHTML = msg;
  }

  renderBoard();
  let ticker = setInterval(updateSomeRows, UPDATE_MS);
  board.addEventListener("mouseenter", () => clearInterval(ticker));
  board.addEventListener("mouseleave", () => {
    clearInterval(ticker);
    ticker = setInterval(updateSomeRows, UPDATE_MS);
  });
  modeSelect.addEventListener("change", () => {
    mode = modeSelect.value;
    renderBoard();
  });
});