const form = document.getElementById("form");
const input = document.getElementById("search");
const result = document.getElementById("result");
const more = document.getElementById("more");
const popup = document.getElementById("popup-container");
const okBtn = document.getElementById("ok");
const finalMessage = document.getElementById("final-message");

const apiURL = "https://api.lyrics.ovh";

async function searchSongs(term) {
  // fetch(`${apiURL}/suggest/${term}`)
  //   .then((res) => res.json())
  //   .then((data) => {
  //     console.log(data);
  //   });

  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();
  showData(data);
}

function showData(data) {
  // let output = "";
  // data.data.forEach((song) => {
  //   output += `
  //   <li>
  //   <span><strong>${song.artist.name} - ${song.title}</strong></span>
  //   <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics </button>
  //   </li>`;
  // });
  // result.innerHTML = `
  // <ul class="songs">
  // ${output}
  // </ul>`;

  result.innerHTML = `<ul class="songs">
  ${data.data
    .map(
      (song) => `<li>
  <span><strong>${song.artist.name} - ${song.title}</strong></span>
  <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics </button>
  </li>`
    )
    .join("")}
  </ul>`;

  if (data.prev || data.next) {
    more.innerHTML = `
    ${
      data.prev
        ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>`
        : ``
    }
    ${
      data.next
        ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>`
        : ``
    }
    `;
  } else {
    more.innerHTML = "";
  }
}

async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const data = await res.json();
  showData(data);
}

async function getLyrics(artist, songtitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songtitle}`);
  const data = await res.json();
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
  result.innerHTML = `<h2><strong>${artist}</strong> - ${songtitle}</h2>
  <span>${lyrics}</span>`;
  more.innerHTML = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  if (!searchTerm) {
    finalMessage.innerText = "Please type in a search term";
    popup.style.display = "flex";
  } else {
    searchSongs(searchTerm);
  }
});

result.addEventListener("click", (e) => {
  const clickedEl = e.target;
  if (clickedEl.tagName === "BUTTON") {
    const artist = clickedEl.getAttribute("data-artist");
    const songtitle = clickedEl.getAttribute("data-songtitle");
    getLyrics(artist, songtitle);
  }
});

okBtn.addEventListener("click", () => {
  popup.style.display = "none";
});
