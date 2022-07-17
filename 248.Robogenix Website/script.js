const smallCursor = document.querySelector(".small-cursor");
const largeCursor = document.querySelector(".large-cursor");

document.onmousemove = (e) => {
  smallCursor.style.left = e.pageX - 5 + "px";
  smallCursor.style.top = e.pageY - 5 + "px";
  smallCursor.style.display = "block";
  largeCursor.style.left = e.pageX - 21 + "px";
  largeCursor.style.top = e.pageY - 21 + "px";
  largeCursor.style.display = "block";
};
